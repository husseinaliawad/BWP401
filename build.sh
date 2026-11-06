#!/usr/bin/env bash
set -euo pipefail

mkdir -p dist
cp ./*.html dist/
cp -R assets dist/
