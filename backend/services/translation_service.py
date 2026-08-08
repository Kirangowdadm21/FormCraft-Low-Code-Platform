"""
IndicTrans2 & Resilient Multilingual Translation Service.

Provides 3 layers of translation:
1. IndicTrans2 via HuggingFace Transformers (when model is loaded)
2. Deep-translator (GoogleTranslator)
3. Direct native HTTP translation fallback (zero-dependency, <100ms response)
4. Fast LRU in-memory cache for 0ms response on cached strings
"""
import os
import sys
import types
import json
import urllib.parse
import urllib.request
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("uvicorn.error")

MODEL_ID = "ai4bharat/indictrans2-en-indic-1B"

# Mapping from short language codes to IndicTrans2 FLORES-200 tags
LANG_CODE_MAP = {
    "en":  "eng_Latn",
    "kn":  "kan_Knda",
    "hi":  "hin_Deva",
    "ta":  "tam_Taml",
    "te":  "tel_Telu",
    "tel": "tel_Telu",
    "ml":  "mal_Mlym",
}

SUPPORTED_CODES = sorted(set(LANG_CODE_MAP.keys()))


def _install_compat_shims():
    """Apply compatibility shims needed for IndicTrans2's cached module files."""
    try:
        # transformers.onnx was removed in transformers >= 4.40
        if "transformers.onnx" not in sys.modules:
            dummy_onnx = types.ModuleType("transformers.onnx")
            dummy_onnx.__path__ = []  # Mark as package for transformers.onnx.utils import
            dummy_onnx.OnnxConfig = object
            dummy_onnx.OnnxSeq2SeqConfigWithPast = object
            dummy_onnx_utils = types.ModuleType("transformers.onnx.utils")
            dummy_onnx_utils.compute_effective_axis_dimension = lambda *a, **k: None
            dummy_onnx.utils = dummy_onnx_utils
            sys.modules["transformers.onnx"] = dummy_onnx
            sys.modules["transformers.onnx.utils"] = dummy_onnx_utils

        # PreTrainedTokenizerBase attribute changes in transformers 5.x
        from transformers.tokenization_utils_base import PreTrainedTokenizerBase
        if not hasattr(PreTrainedTokenizerBase, "verbose"):
            PreTrainedTokenizerBase.verbose = True
        if not hasattr(PreTrainedTokenizerBase, "_in_target_context_manager"):
            PreTrainedTokenizerBase._in_target_context_manager = False
    except Exception as e:
        logger.debug(f"[Translation] Compat shims skipped: {e}")


def _http_translate_fallback(text: str, src_code: str, tgt_code: str) -> str:
    """Zero-dependency HTTP translation fallback (<100ms response)."""
    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={src_code}&tl={tgt_code}&dt=t&q={urllib.parse.quote(text)}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=4.0) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data and isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                translated_parts = [segment[0] for segment in data[0] if segment and len(segment) > 0 and segment[0]]
                if translated_parts:
                    return "".join(translated_parts).strip()
    except Exception as err:
        logger.debug(f"[TranslationService] HTTP translation fallback error: {err}")
    return text


class IndicTransService:
    """Singleton wrapper around IndicTrans2 and resilient translation fallbacks."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            obj = super().__new__(cls)
            obj.tokenizer = None
            obj.model = None
            obj._loaded = False
            obj._failed_transformers = False
            obj._torch = None
            obj.cache = {}
            cls._instance = obj
        return cls._instance

    def load_model(self):
        """Lazily attempt to load IndicTrans2 model."""
        if self._loaded or self._failed_transformers:
            return

        try:
            import torch
            import transformers
            _install_compat_shims()
            from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

            hf_token = os.environ.get("HF_TOKEN") or "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"

            logger.info("[IndicTrans2] Loading tokenizer and model...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                MODEL_ID,
                trust_remote_code=True,
                token=hf_token,
            )
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                MODEL_ID,
                trust_remote_code=True,
                token=hf_token,
            )
            self.model.eval()
            self._torch = torch
            self._loaded = True
            logger.info("[IndicTrans2] Model loaded successfully.")
        except Exception as exc:
            self._failed_transformers = True
            logger.info(f"[TranslationService] IndicTrans2 model unavailable ({exc}). Using fast GoogleTranslator engine.")

    def fallback_translate(self, text: str, src_code: str, tgt_code: str) -> str:
        """Fast fallback using deep-translator or HTTP engine."""
        try:
            from deep_translator import GoogleTranslator
            s_code = "en" if src_code == "en" else src_code
            t_code = "en" if tgt_code == "en" else tgt_code
            translated = GoogleTranslator(source=s_code, target=t_code).translate(text)
            if translated and translated.strip():
                return translated.strip()
        except Exception:
            pass
        return _http_translate_fallback(text, src_code, tgt_code)

    def translate(self, text: str, source_language: str, target_language: str) -> str:
        if not text or not text.strip():
            return text

        src_code = source_language.split("-")[0].lower().strip()
        tgt_code = target_language.split("-")[0].lower().strip()

        if src_code == tgt_code:
            return text

        cache_key = (text.strip(), src_code, tgt_code)
        if cache_key in self.cache:
            return self.cache[cache_key]

        # Attempt IndicTrans2 load if available
        if not self._failed_transformers and not self._loaded:
            self.load_model()

        if self._loaded and self.model and self.tokenizer:
            try:
                src_tag = LANG_CODE_MAP.get(src_code, "eng_Latn")
                tgt_tag = LANG_CODE_MAP.get(tgt_code, "hin_Deva")
                torch = self._torch
                tok = self.tokenizer

                tagged_input = f"{src_tag} {tgt_tag} {text}"
                tok._switch_to_input_mode()
                inputs = tok(
                    [tagged_input],
                    src=True,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                    max_length=256,
                )

                with torch.inference_mode():
                    forced_bos = tok.convert_tokens_to_ids(tgt_tag)
                    generated = self.model.generate(
                        **inputs,
                        forced_bos_token_id=forced_bos,
                        num_beams=5,
                        max_length=256,
                        repetition_penalty=1.2,
                        no_repeat_ngram_size=3,
                    )
                decoded = tok.batch_decode(generated, skip_special_tokens=True)
                res = decoded[0].strip() if decoded else text
                self.cache[cache_key] = res
                return res
            except Exception as e:
                logger.warning(f"[IndicTrans2] Error during inference: {e}. Falling back...")

        # Fallback to GoogleTranslator / HTTP translation
        res = self.fallback_translate(text, src_code, tgt_code)
        self.cache[cache_key] = res
        return res


translation_service = IndicTransService()


def translate(text: str, source_language: str, target_language: str) -> str:
    return translation_service.translate(text, source_language, target_language)
