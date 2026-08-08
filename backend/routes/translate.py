import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from services.translation_service import translate

logger = logging.getLogger("uvicorn.error")

router = APIRouter(tags=["translation"])
executor = ThreadPoolExecutor(max_workers=2)


class TranslateRequest(BaseModel):
    text: str = Field(..., description="The text string to be translated")
    source_language: str = Field("en", description="Short source language code (e.g. en, kn, hi, ta, te, ml)")
    target_language: str = Field(..., description="Short target language code (e.g. en, kn, hi, ta, te, ml)")


class TranslateResponse(BaseModel):
    translated_text: str


@router.post("/translate", response_model=TranslateResponse)
async def translate_text(req: TranslateRequest):
    try:
        loop = asyncio.get_event_loop()
        result = await asyncio.wait_for(
            loop.run_in_executor(
                executor,
                translate,
                req.text,
                req.source_language,
                req.target_language
            ),
            timeout=6.0
        )
        return TranslateResponse(translated_text=result)
    except asyncio.TimeoutError:
        logger.warning(f"Translation timeout for text '{req.text[:30]}...', returning original string")
        return TranslateResponse(translated_text=req.text)
    except ValueError as val_err:
        logger.warning(f"Translation validation error: {val_err}")
        return TranslateResponse(translated_text=req.text)
    except Exception as exc:
        logger.error(f"Translation error: {exc}")
        return TranslateResponse(translated_text=req.text)
