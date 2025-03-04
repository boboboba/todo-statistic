const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    let args = command.split(" ");
    let comments = getComments(files);
    let table = [];
    switch (args[0]) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            table = getTable(getComments(files))
            console.log(table);
            break;
        case 'important':
            table = getTable(getImportantComments(comments));
            console.log(table);
            break;
        case 'user':
            table = getTable(comments.filter(x => getUserName(x) === args[1]));
            console.log(table);
            break;
        case 'sort':
            if (args[1] == 'importance'){
                let importantComments = getImportantComments(comments);
                importantComments.sort(x => countSymbol(x, '!'));
                table = getTable(importantComments);
                console.log(table);
            }
            if (args[1] === 'user'){
                for (let [key, value] of groupByName(comments))
                {
                    console.log(getTable(value));
                }
            }
            if (args[1] === 'date'){
                let sorted = comments.slice();
                sorted.sort(x =>  getDate(x)).reverse();
                console.log(getTable(sorted))
            }
            break;
        case 'date':
            const date = new Date(args[1]);
            console.log(getTable(comments.filter(x => getDate(x) > date)));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function getComments(files){
    let result = [];
    const regex = /^\s*\/\/ TODO*/;
    for (let file of files){
        let lines = file.split("\r\n");
        for (let line of lines){
            if (regex.test(line)){
                result.push(line);
            }
        }
    }
    return result;
}

function getImportantComments(comments){
    return comments.filter((x) => x.includes('!'));
}

function getUserName(comment){
    const regex = /^\/\/ TODO ([^;]+);\s*([^;]+);\s*(.+)$/;
    // console.log(comment.match(regex));
    let match = comment.match(regex);
    if (match !== null)
        return comment.match(regex)[1].toLowerCase();
    return " ";
}

function getDate(comment){
    const regex = /^\/\/ TODO ([^;]+);\s*([^;]+);\s*(.+)$/;
    let match = comment.match(regex);
    if (match !== null)
        return new Date(comment.match(regex)[2]);
    return new Date("950-03-01");
}

function countSymbol(str, symbol){
    let count = 0;
    for (let char of str){
        if (char === symbol){
            count++;
        }
    }
    return count;
}

function groupByName(comments){
    let groups = new Map();
    for (let comment of comments){
        let name = getUserName(comment);
        if (!groups.has(name)){
            groups.set(name, []);
        }
        groups.get(name).push(comment);
    }
    return groups;
}

function getTable(comments){
    let table = [];
    for (let comment of comments){
        let line = [];
        if (countSymbol(comment, '!') === 0){
            line.push(' ');
        } else{
            line.push('!');
        }
        let name = getUserName(comment);
        if (name.length > 10){
            name = name.substr(0, 10) + '...';
        }
        line.push(name);
        let date = getDate(comment);
        let dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay();
        if (date.getFullYear() == 950){
            dateStr = "";
        }
        line.push(dateStr);
        let onlyComment = getOnlyComment(comment); 
        if (onlyComment.length > 50){
            onlyComment = onlyComment.substr(0, 50) + '...';
        }  
        line.push(onlyComment);   
        table.push(line.join(' | '));
    }
    return table;

}

function getOnlyComment(comment){
    const regex = /^\/\/ TODO ([^;]+);\s*([^;]+);\s*(.+)$/;
    let match = comment.match(regex);
    if (match !== null)
        return comment.match(regex)[3];
    return comment.split('TODO')[1];
}
// TODO you can do it!
