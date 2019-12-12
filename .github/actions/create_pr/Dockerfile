FROM node:13.3.0-alpine

RUN npm install @actions/core
RUN npm install @actions/github

COPY index.js /index.js

ENTRYPOINT ["node", "index.js"]
