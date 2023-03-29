const { generateGradeId } = require('./grade');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const inquirer = require('inquirer');

function getSubjectsFromSyllabus(syllabus) {
    const subjectRows = syllabus.slice(4);
    const subjects = subjectRows.map((row) => {
        const grades = [];
        for (let i = 6; i <= 25; i++) {
            if (row[i] !== '') {
                grades.push(generateGradeId(syllabus, i));
            }
        }
        const dom = new JSDOM(row[2]);
        const document = dom.window.document;

        const a = document.querySelector('a');
        const linkParams = new URLSearchParams(
            a.href.substring(a.href.indexOf('?'))
        );

        return {
            name: a.innerHTML,
            id: linkParams.get('subject_id'),
            actualYear: linkParams.get('year'),
            grades,
        };
    });
    return subjects;
}

async function promptSubjectList(subjects) {
    return (
        await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'subject',
                message:
                    '学年に応じた科目が選択されました．変更がある場合は選択してください．\n科目を選択',
                choices: subjects.map((v) => ({
                    name: `${v.name} (${v.id})`,
                    value: v,
                    checked: v.checked,
                })),
                validate(value) {
                    if (value.length <= 0) {
                        return '1つ以上選択してください(選択はスペース，決定はEnterです)．';
                    }

                    return true;
                },
            },
        ])
    ).subject;
}

module.exports = { getSubjectsFromSyllabus, promptSubjectList };
