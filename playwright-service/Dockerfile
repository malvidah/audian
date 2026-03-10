FROM mcr.microsoft.com/playwright:v1.42.0-jammy

WORKDIR /app

COPY package.json ./
RUN npm install
RUN npx playwright install chromium

COPY src/ ./src/

ENV PORT=3001
EXPOSE 3001

CMD ["node", "src/server.js"]
