# Christ Habits — dev + CI entry points. CI calls these same targets.
# Testing happens in Expo Go: `make start`, scan QR. PR previews: EAS Update + QR comment.

NPX ?= npx
EAS ?= $(NPX) eas-cli@latest
BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD 2>/dev/null)
EAS_FLAGS ?=
PLATFORM ?= android

.DEFAULT_GOAL := help
.PHONY: help install ci-install start start-lan lint typecheck format format-check test doctor bundle check ci \
        update update-production build-preview build-production submit release-patch release-minor clean

help: ## List targets
	@grep -hE '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*## "}{printf "  \033[36m%-18s\033[0m %s\n",$$1,$$2}'

## ---- setup ----
install: ## Install deps (local)
	npm install

ci-install: ## Install deps exactly from lockfile (CI)
	npm ci

## ---- run in Expo Go ----
start: ## Dev server with tunnel (needed under WSL); scan QR in Expo Go
	$(NPX) expo start --tunnel

start-lan: ## Dev server on LAN (faster, phone must reach this machine)
	$(NPX) expo start --lan

## ---- quality ----
lint: ## Lint
	$(NPX) expo lint

typecheck: ## TypeScript check
	$(NPX) tsc --noEmit

format: ## Format code
	$(NPX) prettier --write .

format-check: ## Verify formatting
	$(NPX) prettier --check .

test: ## Unit tests (Jest)
	$(NPX) jest --ci --coverage

doctor: ## Expo dependency/config diagnostics
	$(NPX) expo-doctor

bundle: ## Export Android JS bundle (catches Metro/bundling errors)
	$(NPX) expo export --platform android --output-dir dist

check: lint typecheck format-check test ## Fast local gate (run before done)

ci: check doctor bundle ## Everything CI runs

## ---- EAS (needs EXPO_TOKEN or `eas login`) ----
update: ## Publish EAS Update for current git branch (open in Expo Go)
	$(EAS) update --auto --branch $(BRANCH) --non-interactive

update-production: ## OTA JS-only fix to production
	$(EAS) update --channel production --auto --non-interactive

build-preview: ## Installable Android APK (internal distribution)
	$(EAS) build --platform android --profile preview --non-interactive --no-wait $(EAS_FLAGS)

build-production: ## Production build (PLATFORM=android|ios|all)
	$(EAS) build --platform $(PLATFORM) --profile production --non-interactive --no-wait $(EAS_FLAGS)

submit: ## Submit latest production builds to stores
	$(EAS) submit --platform all --profile production --latest --non-interactive

## ---- release ----
release-patch: ## Bump patch, tag vX.Y.Z, push (triggers production build)
	npm version patch && git push --follow-tags

release-minor: ## Bump minor, tag, push
	npm version minor && git push --follow-tags

clean: ## Remove build output
	rm -rf dist .expo
