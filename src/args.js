const yargs = require('yargs');
const quote = require('shell-quote/quote');

function getArgs() {
    return yargs
        .scriptName('fetch-kosen-syllabus')
        .command(
            '* [path]',
            '高専のシラバスPDFを一括ダウンロードする',
            (yargs) => {
                return yargs.positional('path', {
                    describe: 'ダウンロード先のディレクトリパス',
                    default: process.cwd(),
                    type: 'string',
                });
            }
        )
        .option('school-id', {
            describe: '学校ID',
            type: 'string',
        })
        .option('department-id', {
            describe: '学科ID',
            type: 'string',
        })
        .option('year', {
            describe: '年度',
            type: 'string',
        })
        .option('grades', {
            describe: '学年',
            type: 'array',
        })
        .option('additional-subjects', {
            describe: '追加する科目ID',
            type: 'array',
        })
        .option('exclude-subjects', {
            describe: '除外する科目ID',
            type: 'array',
        })
        .option('marge', {
            default: true,
            describe: 'ダウンロード完了時にPDFをマージする',
            type: 'boolean',
        })
        .option('prompt', {
            default: true,
            describe: '最終確認をする',
            type: 'boolean',
        })
        .parseSync();
}

function generateCommandLine(args) {
    const strings = ['npx', 'fetch-kosen-syllabus'];
    function addFromKeys(key) {
        if (args[key]) {
            strings.push(`--${key}`);
            strings.push(args[key]);
        }
    }
    function addArrayFromKeys(key) {
        if (args[key]) {
            strings.push(`--${key}`);
            args[key].forEach((arg) => {
                strings.push(arg);
            });
        }
    }

    addFromKeys('school-id');
    addFromKeys('department-id');
    addFromKeys('year');
    addArrayFromKeys('grades');
    if (args?.['additional-subjects']?.[0] === false) {
        strings.push('--no-additional-subjects');
    } else {
        addArrayFromKeys('additional-subjects');
        addArrayFromKeys('exclude-subjects');
    }
    return quote(strings);
}

module.exports = { getArgs, generateCommandLine };
