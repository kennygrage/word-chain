const request = require('request');
const inquirer = require('inquirer');

var wordList;
var inputWords;


async function main() {
    await Promise.all([getWordList(), getStartAndEndWords()]).then(() => {
        if (!inputsAreSameLength(inputWords))
            console.log("Start word and end word not the same length");
        else if (!endWordIsInDictionary(inputWords.endWord))
            console.log("End word is not in the dictionary");
        else {
            var sameSizedWordList = getSameSizedWordList();
            var wordChain = createWordChain(sameSizedWordList);
            printWordChain(wordChain);
        } //end else
    });
} //end main()


//Get Word List from the Code Kata Website
function getWordList() {
    request({
        uri: 'http://codekata.com/data/wordlist.txt',
        method: "GET",
        json: true,
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, (err, res, body) => {
        if (err)
            console.log(err);
        else {
            wordList = body.split("\n");
            wordList = wordList.map(function(x){ return x.toLowerCase(); });
        } //end else
    }); //end request
} //end getWordList()


async function getStartAndEndWords() {
    const questions = [
        {
            name: 'startWord',
            type: 'input',
            message: 'Enter start word.',
            validate: function (value) {
                if (value.length)
                    return true;
                else
                    return 'Please enter start word.';
            } //end validate
        }, //end startWord question
        {
            name: 'endWord',
            type: 'input',
            message: 'Enter end word.',
            validate: function(value) {
                if (value.length)
                    return true;
                else
                    return 'Please enter end word.';
            } //end validate
        } //end endWord question
    ]; //end questions
    inputWords = await inquirer.prompt(questions);
} //end getStartAndEndWords()


function inputsAreSameLength(inputWords) {
    return (inputWords.startWord.length = inputWords.endWord.length ? true : false);
} //end inputsAreSameLength()


function endWordIsInDictionary(endWord) {
    return (wordList.includes(endWord));
} //end endWordIsInDictionary()


function getSameSizedWordList() {
    var sameSizedWordList = [];
    for (var i=0; i<wordList.length; i++) {
        if (wordList[i].length == inputWords.startWord.length)
            sameSizedWordList.push(wordList[i].toLowerCase());
    } //end for
    return sameSizedWordList;
} //end narrowedDownWordList()


function nextChar(char) {
    return String.fromCharCode(char.charCodeAt(0) + 1);
} //end nextChar()


function createWordChain(sameSizedWordList) {
    var wordChain = [];
    wordChain.push(inputWords.startWord);

    //Remove startWord from the word list
    var index = sameSizedWordList.indexOf(inputWords.startWord);
    if (index > -1)
        sameSizedWordList.splice(index, 1);

    var currentWord = inputWords.startWord;
    while (wordChain[wordChain.length-1] != inputWords.endWord) {
        if (currentWord == inputWords.endWord)
            return wordChain;

        //will equal 1 when a letter is changed to the same letter as endWord
        var foundAGoodChange = 0;

        for (var i=0; i<currentWord.length; i++) {
            var currentCharArray = currentWord.split('');
            var endWordCharArray = inputWords.endWord.split('');
            if (currentCharArray[i] == endWordCharArray[i])
                continue;
            currentCharArray[i] = endWordCharArray[i];
            var newWord = currentCharArray.join('');
            if(sameSizedWordList.indexOf(newWord) != -1) {
                wordChain.push(newWord);
                index = sameSizedWordList.indexOf(newWord);
                if (index > -1)
                    sameSizedWordList.splice(index, 1);
                currentWord = newWord;
                foundAGoodChange = 1;
                break;
            } //end if
        } //end for

        if (!foundAGoodChange) {
            for (var i=0; i<currentWord.length; i++) {
                var currentCharArray = currentWord.split('');
                for (var j='a'; j<='z'; j=nextChar(j)) {
                    currentCharArray[i] = j;
                    var newWord = currentCharArray.join('');
                    if(sameSizedWordList.indexOf(newWord) != -1) {
                        wordChain.push(newWord);
                        index = sameSizedWordList.indexOf(newWord);
                        if (index > -1)
                            sameSizedWordList.splice(index, 1);
                        currentWord = newWord;
                    } //end if
                }//end inner for
            } //end outer for
        } //end if
    } //end while
    return wordChain;
} //end createWordChain()


function printWordChain(wordChain) {
    if (wordChain.length <= 1)
        console.log("Word chain doesn't exist");
    else {
        for (var i=0; i<wordChain.length; i++) {
            console.log(wordChain[i]);
        } //end for
    } //end else
} //end printWordChain()


main();
