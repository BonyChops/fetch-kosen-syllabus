import { generateGradeId } from './grade';
import { JSDOM } from 'jsdom';
import inquirer from 'inquirer';
import { Subject, Syllabus } from './types';

function getSubjectsFromSyllabus(syllabus: Syllabus): Subject[] {
    const subjectRows = syllabus.slice(4);

    return subjectRows.map((row) => {
        const grades = [];
        for (let i = 6; i <= 25; i++) {
            if (row[i] !== '') {
                grades.push(generateGradeId(syllabus, i));
            }
        }
        const dom = new JSDOM(row[2]);
        const document = dom.window.document;

        const a = document.querySelector('a');

        if (!a) {
            return null;
        }

        const linkParams = new URLSearchParams(
            a.href.substring(a.href.indexOf('?'))
        );

        return {
            name: a.innerHTML,
            id: linkParams.get('subject_id'),
            actualYear: linkParams.get('year'),
            grades
        };
    }).filter(v => v !== null) as Subject[];
}

async function promptSubjectList(subjects: (Subject & { checked?: boolean })[]) {
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
                    checked: v.checked
                })),
                validate(value) {
                    if (value.length <= 0) {
                        return '1つ以上選択してください(選択はスペース，決定はEnterです)．';
                    }

                    return true;
                }
            }
        ])
    ).subject;
}

export {
    getSubjectsFromSyllabus, promptSubjectList
};
