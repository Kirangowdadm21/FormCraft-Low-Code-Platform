import os
import sys
import types
from dotenv import load_dotenv

# Compatibility shims for dynamic IndicTrans2 code running on modern transformers (5.x)
if "transformers.onnx" not in sys.modules:
    dummy_onnx = types.ModuleType("transformers.onnx")
    dummy_onnx.OnnxConfig = object
    dummy_onnx.OnnxSeq2SeqConfigWithPast = object
    dummy_onnx_utils = types.ModuleType("transformers.onnx.utils")
    dummy_onnx_utils.compute_effective_axis_dimension = lambda *a, **k: None
    dummy_onnx.utils = dummy_onnx_utils
    sys.modules["transformers.onnx"] = dummy_onnx
    sys.modules["transformers.onnx.utils"] = dummy_onnx_utils

from transformers.tokenization_utils_base import PreTrainedTokenizerBase

# Fix for AttributeError: IndicTransTokenizer has no attribute verbose / _special_tokens_map
PreTrainedTokenizerBase.verbose = True
PreTrainedTokenizerBase._in_target_context_manager = False

if not hasattr(PreTrainedTokenizerBase, "_special_tokens_map"):
    def _get_stm(self):
        if not hasattr(self, "_stm_dict"):
            self._stm_dict = {}
        return self._stm_dict

    def _set_stm(self, val):
        self._stm_dict = val

    PreTrainedTokenizerBase._special_tokens_map = property(_get_stm, _set_stm)

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

load_dotenv()

MODEL_ID = "ai4bharat/indictrans2-en-indic-1B"

def main():
    hf_token = os.environ.get("HF_TOKEN") or "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"
    
    print("Loading tokenizer...", flush=True)
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_ID,
        trust_remote_code=True,
        token=hf_token
    )
    
    print("Loading model...", flush=True)
    model = AutoModelForSeq2SeqLM.from_pretrained(
        MODEL_ID,
        trust_remote_code=True,
        token=hf_token
    )
    
    print("Model loaded successfully.", flush=True)

if __name__ == "__main__":
    main()
