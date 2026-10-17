#!/bin/sh
# The teacher's Jump to… test airlines (D102, Screens brief 3): the chapter tests run one after another along the Steady
# path, each saving the airline at the jump points (Launch Day, weeks 2–5, 7, 9, December, January and June 2031,
# chapters 3 and 4) into src/opening/tests/fixtures/jumps/. The build embeds them, gzipped, as data-jumps.
# Run again after a change to the engine or the data, then rebuild:  sh tools/make_jumps.sh && python3 src/opening/build.py
set -e
cd "$(dirname "$0")/../src/opening/tests"
J="$(pwd)/fixtures/jumps"; T="${TMPDIR:-/tmp}/airline-jumps"; mkdir -p "$J" "$T"
export NODE_PATH="${NODE_PATH:-/opt/node-tools/node_modules}" SHOTS=0 JUMPS="$J"
UPTO=200 SAVE="$T/ch1.txt" OUT="$T/w" node week.test.js | tail -2
CODE="$T/ch1.txt" SAVE="$T/ch2.txt" OUT="$T/c2" node chapter2.test.js | tail -2
CODE="$T/ch2.txt" SAVE="$T/ch3.txt" OUT="$T/c3" node chapter3.test.js | tail -2
CODE="$T/ch3.txt" UPTO=740 OUT="$T/c4" node chapter4.test.js | tail -2
ls -l "$J"
