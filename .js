if (!window.Replacer) {
	window.Replacer = (function () {
		var replaceStringFunction = (function () {
			var find = /\$(?:(\$)|(&)|(`)|(')|(\d+))/g,
				replace = function (match, dollar, all, before, after, group) {
					return (
						dollar ? "$"
						: before ? args.input.substring(0, args.offset)
						: after ? args.input.substring(args.offset + args.match.length)
						: group ? ((args[group] != null) ? args[group] : match)
						: args.match // defualt OR all
					);
				},
				args;

			function generateReplacement(inputArgs, replaceString) {
				args = inputArgs;
				args.match = args[0];
				args.offset = args[args.length - 2];
				args.input = args[args.length - 1];

				return replaceString.replace(find, replace);
			}

			return function replaceStringFunction(replaceString) {
				var fn = function () {
					return generateReplacement(arguments, replaceString);
				};
				fn.base = replaceString;
				fn.toString = function () { return this.base; };
				return fn;
			};
		})();

		function Replacer(find, replace) {
			var fn = function (input) {
				return input.replace(find, replace);
			}

			fn.find = find;
			fn.replace = replace;

			return fn;
		}

		Replacer.aggregate = (function () {
			var i, c, l, lastIndex;
			var findA = [];

			var groups = (function () {
				var groupsRegex;

				return function groups(find) {
					if (typeof (find) === "string") { return 0; }

					groupsRegex = new RegExp("$|" + find.source);
					return groupsRegex.exec("").length - 1;
				};
			})();

			function setFlags(flags) {
				this.find = new RegExp(this.find.source, flags);
				return this;
			}

			return function Replacer_aggregate(replacers) {
				if (replacers instanceof Array) {
					return Replacer_aggregate.apply(this, replacers);
				}

				var find, replace, replaceA = {};
				i = 0, c, l = arguments.length, lastIndex = 1;
				while (i < l) {
					c = arguments[i];

					find = (
						(typeof (c.find) === "string")
							? ("\\" + c.find.split("").join("\\"))
							: c.find.source
					);
					replace = (
						(typeof (c.replace) === "string")
							? replaceStringFunction(c.replace)
							: c.replace
					);
					replace.groups = groups(c.find);

					findA.push(find);
					replaceA[lastIndex] = replace;
					lastIndex += 1 + replace.groups;

					i++;
				}

				// create new find and replace
				find = new RegExp("(" + findA.join(")|(") + ")", "g");
				replace = (function () {
					var index;

					return function () {
						for (index in replaceA) {
							if (arguments[index] !== undefined) {
								var args = Array.prototype.slice.call(arguments, +index, +index + replaceA[index].groups + 1);
								args.push(arguments[arguments.length - 2], arguments[arguments.length - 1]);

								return replaceA[index].apply(this, args);
							}
						}
					};
				})();

				// cleanup
				findA.splice(0);

				// return
				var fn = function (input) {
					return input.replace(find, replace);
				};
				fn.find = find;
				fn.replace = replace;
				fn.replace.base = replaceA;
				fn.setFlags = setFlags;
				return fn;
			};
		})();

		return Replacer;
	})();
}