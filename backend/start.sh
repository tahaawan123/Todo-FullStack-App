#!/bin/bash
PORT=${PORT:-7860}
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 75
