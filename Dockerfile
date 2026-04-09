FROM node:20-bullseye AS build-frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html ./frontend/
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
WORKDIR /app/frontend
RUN npm install
RUN npm run build

FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
COPY --from=build-frontend /app/frontend/dist ./frontend/dist
ENV PORT=7860
EXPOSE 7860
CMD ["sh","-c","uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860}"]