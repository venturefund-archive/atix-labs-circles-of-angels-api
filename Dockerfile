FROM docker.atixlabs.com/node:10.15.3-alpine


# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app

# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python && \
    npm install --quiet node-gyp -g &&\
    npm install --quiet && \
    apk del native-deps


# Installing dependencies
COPY package*.json ./
RUN npm install

# Copying source files
COPY . .

# Building app
RUN npm run build

# Running the app
CMD [ "npm", "index" ]

