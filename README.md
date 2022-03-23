ctext is a command-line utility for text processing. 

# Usage:
example: `ctext "hello" "world" --join " " --case title --append "!"`

First, you add inputs by putting text in quotation marks. You can use filenames to read text from a file. If you would like to use a file path as the text itself, add a backslash to the beginning of the string.

Next, add operators by using double dash flags. These operators are methods that modify your inputs in various ways. To get a list of all operators, use the `--help` command. Then use `--help [operator]` to get information about a specific one.

Two types of operators exist, single and multi. Single operators will run individually on each value currently in the value list. Multi operators will take all values as input as usually output a single value. 

You can use selections by adding a comma-separated list of indexes at the end of an operator name, like `--join[0,1]`. This will mean that the operator will only apply itself to certain values. 

You can set variables with `--set`. Use a question mark and then a variable name in arguments to read a variable's value. 

Use the `-o` flag to output values to text files.

Multiple other flags exist:
* `-f`: Forces the display of text to the console even if it exceeds the length limit
* `-h`: Stops text from being displayed in the console
* `-p`: Shows how long the operations took