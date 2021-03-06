// console shim
if (!window.console) { window.console = {}; }
if (!console.log) { console.log = function (messages) { }; }
if (!console.group) { console.group = function (name) { console.log("_____vv "+name); } }
if (!console.groupEnd) { console.groupEnd = function () { console.log("^^-----") }; }

console.group("aggregate");
{
	var aggregate = Replacer.aggregate(
		{ find: /(2)/, replace: "[dollar:$$, match:$&, before:$`, after:$', group:$1]" },
		{ find: /a(?=(h))/, replace: function (match, h) { return match + h.toUpperCase(); } }
	);

	var test = "123";
	var result = aggregate(test);
	var pass = "1[dollar:$, match:2, before:1, after:3, group:2]3";
	console.log(test+" -> "+result);
	if (result != pass) { console.warn("should be: ", pass); }

	test = "blah";
	result = aggregate(test);
	pass = "blaHh";
	console.log(test + " -> " + result);
	if (result != pass) { console.warn("should be: ", pass); }
}
console.groupEnd();

console.group("converted string-pattern");
{
	var converted = Replacer.aggregate(
		{
			find: "\\^$*+?.(=)!|{,}[]\n",
			replace: "pass"
		}
	);

	test = "\\^$*+?.(=)!|{,}[]\n";
	result = converted(test);
	pass = "pass";
	console.log(test.replace("\n", "\\n") + " -> " + result);
	if (result != pass) { console.warn("should be: ", pass); }

}
console.groupEnd();

var generateFindStringPattern = Replacer(
	new RegExp(
		"('|\\\"|\n|\r|\t|\b|\f)|" +
		"(\\" + ("\\^$*+?.(=)!|{,}[]".split("").join("|\\")) + ")",
		"g"
	),
	function (match, escaped) {
		if (match.length === 0) { debugger; }
		if (escaped) { return match; }
		else { return "\\" + match; }
	}
);



//var aggregate = Replacer.aggregate(
//	{ find: "a", replace: "[$&]" },
//	{ find: /b(?=l)/, replace: function (match) { return "{"+match+"}" } }
//);
//console.dir(aggregate);

//console.log(aggregate("blah"));
