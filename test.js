// console shim
if (!window.console) { window.console = {}; }
if (!console.log) { console.log = function (messages) { }; }
if (!console.group) { console.group = function (name) { console.log(name + "_____vv"); } }
if (!console.groupEnd) { console.groupEnd = function () { console.log("^^-----") }; }

console.group("aggregate");
{
	var aggregate = Replacer.aggregate(
		{ find: /(2)/, replace: "[dollar:$$, match:$&, before:$`, after:$', group:$1]" },
		{ find: /a(?=(h))/, replace: function(match, h){return match+h.toUpperCase();} }
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
