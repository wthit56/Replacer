# Replacer

Over the years, As I've learned and used Regex in JavaScript, I've come to realise that pretty 
much all you do with it is find stuff, and replace it with other stuff. Also, doing anything 
more complex with Regex is almost impossible unless you figure out a way of splitting apart your 
patterns and combining them correctly; which is a ton of work in itself.


## Create a Replace Function
Now, to do this with memory usage in mind, you need to have variables for both the Regex, and 
the replacement function. So this either means having a whole ton of long-named variables, or a 
load of object literals, one for each replacement.

_snip-1:_
```js
var quote_find = /["']/g, quote_replace = function(match){ return "\\" + match; };
var num = {
	find: /(0x)?\d+/g,
	replace: function(match, isHex){
		return "\" + (" + (isHex ? new Number(match).toString() : match) + ").toString() + ";
	}
};
```

So this is the first thing you can do with Replacer. Just pass in _find_ and _replace_ 
parameters, and it will produce an easy-to-use function that will perform the replace on any 
string given it.

_snip-2:_
```js
var fix_quotes = Replacer(/["']/g, function (match){ return "\\" + match; });
fix_quotes("'blah'"); // \'blah\'

var fix_nums = Replacer(/(0x)?\d+/g, function(match, isHex){
	return "\" + (" + (isHex ? new Number(match).toString() : match) + ").toString() + "; }
});
fix_nums("0x10"); // " + (16).toString() + "

```

The _find_ and _replace_ used for this function are also stored as `fix_quotes.find` and 
`fix_quotes.replace` to use as you wish.

> As it just does a plain old `input.replace(find, replace)` under the hood, you can pass in 
> strings if you prefer to to things that way.

Okay, so it gives you a little function to call instead of `string.replace(find, replace)`. 
Useful, but not _that_ useful. Time to bring out the big guns&hellip;


## Create an Aggregate of Many Replacements

I said earlier that while it's possible, it sure isn't easy trying to break apart and combine 
Regex patterns in an easy way that works. What you could do is something like the following:

_snip-1.1:_
```js
var fix_both_find = "(" + quote_find.source + ")|(" + num_find.source + ")";
var fix_both_replace = function (match, quote_found, num_found, num_isHex){
	if(quote_found !== undefined){ return "\\" + match; }
	else if(num_found !== undefined){
		return "\" + (" + (isHex ? new Number(match).toString() : match) + ").toString() + ");
	}

	return match;
};
var fix_both = function (input){
	return input.replace(fix_both_find, fix_both_replace);
};
fix_both("'blah' 0x10"); // \'blah\' " + (16).toString() + "
```

So the above will work fine, but you have to do everything yourself. You have to join the 
patterns correctly, and write the branching logic for each pattern's replace function.

So, I've built Replacer with an `.aggregate()` function. This will take any number of 
"replacers", or objects that _look_ like replacers (with a `.find` and `.replace` property). 
Alternatively, you can pass in an array of such objects and things will work just fine.

The _aggregate_ function will then loop through all of these objects and combine all the 
patterns into one big uber-pattern, and index the _replace_ functions. So when a pattern is 
matched, the relevant _replace_ will be used to replace the matched string.

All the groups from that pattern will be passed in, along with the match itself. The index and 
input values will be tagged onto the end just like you were using the regular old 
Regex/replaceFunction way.

> Even _string-format_ finds and replaces can be used; they will be converted into a Regex 
> pattern and a function will be created to correctly generate the replace string based on the 
> matched pattern.

_snip-2.1:_
```js
var fix_both = Replacer.aggregate(fix_quotes, fix_nums);
fix_both("'blah' 0x10"); // \'blah\' " + (16).toString() + "
```

An Replacer aggregate function also _looks_ like a replacer. The newly generated Regex and replacer 
function are stored as `.find` and `.replace` properties on the returned function. This means 
that you can even use the aggregated function as part of a new aggregate function, nesting your 
logic internally while keeping things clear and separate on the outside.


> Any Regex or replace-function created through aggregating will have a `.base` property.
> This will allow you see how the final product was built through your browser's console, 
> which will be useful for debugging. A `.toString()` method will be added to any string 
> replaces converted into functions, which means some browser consoles will show the original 
> string as a preview of the generated function.


## To Do

- _Fix Groups_: at the moment, any group references within the _find_ parameter are ignored. 
Ideally these would be scanned and tweaked in the build process to reference the new group 
positions.
	- NOTE: If the new group position is greater than 9, it won't work. Perhaps throw an error?

- _Re-write Snippets_: snippets examples don't necessarily make sense, and have not been tested. 
This needs to be done.

- _Add Comments to .js file_.

- _Re-write testing page_.
