BIN = node_modules/.bin
DUO = $(BIN)/duo
MINIFY = $(BIN)/uglifyjs
WATCH = $(BIN)/wr
WATCH_FILES = lib index.js Makefile
BUILD = ./dist

build: node_modules
	@mkdir -p $(BUILD)
	@$(DUO) --quiet --stdout --global reepay index.js > $(BUILD)/reepay.js
	@$(MINIFY) $(BUILD)/reepay.js --output $(BUILD)/reepay.min.js

node_modules: package.json
	@npm install --silent

watch: node_modules
	@$(WATCH) make $(WATCH_FILES)
    
.PHONY: build