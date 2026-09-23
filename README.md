# mushcode README

This tool is a combination of a mush stynax highlighter and a mushcode formatter.

## Basic formatting

The formatter is available as a context menu item.  Just select the code you want to format, right click, and select "Format mushcode".  That's it.

## Send to RHOST

If you're running a RhostMUSH [1] you can actually send your code right to your api object to install directly to server!

First, update your settings to include your RhostMUSH API key and the name of your api object.  Then, select the code you want to send, right click, and select "Send to RHOST".  The code will be sent to your api object and installed on your server.

You can also se the keyboard shortcut `ctrl-shift-f` to send the code to RHOST.

### RHOST compatibility note

Axios was updated to reduce the known vulnerability surface in the optional
RHOST posting feature. The extension builds successfully with the updated
version, but posting to a live RhostMUSH API endpoint has not been verified.
Users of this feature should test it against their own game before relying on
it and report any compatibility issues.

* [1] http://rhostmush.org


## Formatting Rules

The rules of the game are pretty simple! If the first column of a line isn't a comment, space or newline, it interprets it as the beginning of a line. If your line begins with any of the above things, it'll be removed. An example:

```
// This line won't render
&command.cmd #123 = $things:
  @pemit %#=And Stuff. // this line will be added to the first.

- // A single dash on a line makes an extra return in
  // the compressed code

@@ This comment will appear in the compressed code.
@@ Great for leaving notes in your final compressed code block!
```

Translates to:

```
&command.cmd #123=$things: @pemit %#=And Stuff

@@ This comment will appear in the compressed code.
@@ Great for leaving notes in your final compressed code block!
```

C-style block comment highlighting (`/* ... */`) is enabled by default. Set
`mushcode.blockComments.enabled` to `false` to treat those characters as normal
MUSHCode text. This does not change `//` or `@@` comment highlighting.

## Meta Tags

Meta tags are a way to add extra functionality to your formatted mushcode scripts. They cover things like importing other files and mushc scripts, to controlling conditional formatting of compile-time commands.

### `#include <URL or Path>`

`#include` allows you to add mushcode from a url into your code before processing. If path is given with a file name, it will open that file to use as it's starting point from the last given directory, or the base of the project. [Example Repo](https://github.com/lcanady/archive-test.git) for a dummy implementation.

```
#include https://raw.githubusercontent.com/lcanady/archive-test/main/index.mu

// ... More code ...
```

### `#file /path/to/file.txt`

This meta-tag will import a file like `#include` but will add mush comments `@@` to every line, making a note for anyone reading through your compressed code source. This is great for offering things like install instructions, and licenses.

**`text.txt`**

```
This is a test file.
It's a multi-line file.
```

**`index.mush`**

```
#file ./text.txt
```

**results**

```
@@ This is a test file.
@@ It's a multi-line file.
```

### `@define`

`@define` allows you to save a few keystrokes, and `@define` your own directives Defines, when used later, will be replaced with whatever code you give them. Just remember! Defines follow the same basic formatting rules. Any time line starts with anything other than a space - it counts as a new command.

`Tests` are regular expressions as strings. This means that spaces should be entered as a space " ".

```
@define @te[st]+ (.*) {
think This is a
  test:
  $1
}

@test Foo
```

Then later, when the formatter is run, the above example becomes:

```
think This is a test: Foo
```

### `@debug`

The `@debug` directive tells the preprocessor that you would like to include any `#debug {}` meta-tags. The closing curly-brace `}` of the `#debug` block must be on it's own line, as the first character or else it won't be recognized.

```
@debug

// ...

#debug {

think %chThis will be included in the processed code!%cn

} // Make sure the closing curly-brace is the first character on
  // a new line!
```


## development
```
git clone https//github.com/lcanady/mushcode.git
npm install
```
