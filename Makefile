all: node-modules

node-modules:
	npm install
	npm prune

jshint:
	node_modules/.bin/jshint --config config/jshint-node.json .

ifdef TRAVIS
  MOCHA_ARGS = --reporter tap
endif

test: jshint
	mocha $(MOCHA_ARGS)

PHONY: node-modules test jshint
