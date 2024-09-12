from fastapi import UploadFile, HTTPException
import cuid
from os.path import join
import os

from settings import BASE_DIR

async def temp_save_file(file: UploadFile) -> str:
    temp_file = join(BASE_DIR,f'temp')
    if os.path.exists(temp_file):
        temp_file = join(temp_file, f'{cuid.cuid()}_{file.filename}')
        data = await file.read()
        with open(temp_file, 'bw') as tfile:
            tfile.write(data)
        return temp_file
    else:
        raise HTTPException(500, "Somewent wrong")