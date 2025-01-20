#!/usr/bin/env sh

#----------
#
#  A. Purpose
#
#    Fix all test fixtures after updating the source code.
#
#  B. Usage
#
#    ./update-test-fixtures.sh
#
#---------

# Update fixtures
rm -r "tests/fixtures/sample-project/output"
cp -r "tests/fixtures/sample-project/input" "tests/fixtures/sample-project/output"

./dist/bin/ultimed-i18n.js \
  --root "tests/fixtures/sample-project/output"
