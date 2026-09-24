const assert = require("node:assert/strict");
const test = require("node:test");
const { formatter } = require("@digibear/mush-format");
const { joinBraceContinuationLines } = require("./format-output");

test("joins formatter output split by standalone braces", () => {
  const formatted = [
    "&JOIN flyer=$join * *:@wait me/data_semaphore=",
    "{@include foo;@switch test={@pemit me=yes}",
    "}",
  ].join("\n");

  assert.equal(
    joinBraceContinuationLines(formatted),
    "&JOIN flyer=$join * *:@wait me/data_semaphore={@include foo;@switch test={@pemit me=yes}}"
  );
});

test("preserves boundaries before ordinary commands", () => {
  const formatted = "&ONE me={value}\n&TWO me={other}";

  assert.equal(joinBraceContinuationLines(formatted), formatted);
});

test("joins nested column-zero braces produced by mush-format", async () => {
  const source = [
    "&JOIN flyer=$join * *:@wait me/data_semaphore=",
    "{",
    "    @include reference/context=[num(me)];",
    "    @switch/first test=",
    "    0/*/*/*,",
    "    {",
    "        @pemit %0=not yours",
    "    };",
    "    @notify me/data_semaphore",
    "}",
  ].join("\n");

  const formatted = await formatter.format(source);

  assert.equal(
    joinBraceContinuationLines(formatted.data),
    "&JOIN flyer=$join * *:@wait me/data_semaphore={@include reference/context=[num(me)];@switch/first test=0/*/*/*,{@pemit %0=not yours};@notify me/data_semaphore}"
  );
});
