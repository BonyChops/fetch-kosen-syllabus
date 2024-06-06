import yargs from 'yargs';
import { quote } from 'shell-quote';

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
            },
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

type UOrUndefinedProps<T, U> = {
    [K in keyof T as T[K] extends U | undefined ? K : never]: T[K];
};

function generateCommandLine(args: ReturnType<typeof getArgs>) {
    const strings = ['npx', 'fetch-kosen-syllabus'];

    function addFromKeys(
        key: keyof UOrUndefinedProps<typeof args, string | number>,
    ) {
        if (args[key]) {
            strings.push(`--${key}`);
            strings.push(String(args[key]));
        }
    }

    function addArrayFromKeys(
        key: keyof UOrUndefinedProps<typeof args, (string | number)[]>,
    ) {
        const t = args[key];
        if (t) {
            strings.push(`--${key}`);
            t.forEach((arg) => {
                strings.push(String(arg));
            });
        }
    }

    addFromKeys('school-id');
    addFromKeys('department-id');
    addFromKeys('year');
    addArrayFromKeys('grades');
    if (!args?.['additional-subjects']?.[0]) {
        strings.push('--no-additional-subjects');
    } else {
        addArrayFromKeys('additional-subjects');
        addArrayFromKeys('exclude-subjects');
    }
    return quote(strings);
}

export { getArgs, generateCommandLine };
