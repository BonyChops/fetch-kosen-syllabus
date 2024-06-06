import inquirer from 'inquirer';
import { Grade, Syllabus } from './types';

function getGradeList(syllabus: Syllabus): Grade[] {
    const gradeCols: number[] = [];
    syllabus[0].forEach((element, i) => {
        if (element === '学年別週当授業時数') {
            gradeCols.push(i);
        }
    });
    return gradeCols.map((v) => ({
        grade: syllabus[1][v],
        semester: syllabus[2][v],
        quoter: syllabus[3][v],
        id: generateGradeId(syllabus, v),
    }));
}

async function promptGradeList(grades: Grade[]) {
    return (
        await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'grades',
                message: '学年, 学期を選択',
                choices: grades.map((v) => ({
                    name: `${v.grade} ${v.semester}期 (${v.id})`,
                    value: v,
                })),
                validate(value) {
                    if (value.length <= 0) {
                        return '1つ以上選択してください(選択はスペース，決定はEnterです)．';
                    }

                    return true;
                },
            },
        ])
    ).grades;
}

function generateGradeId(syllabus: Syllabus, colNum: number) {
    return `${syllabus[1][colNum].substring(
        0,
        syllabus[1][colNum].length - 1,
    )}-${syllabus[3][colNum]}`;
}

export { getGradeList, promptGradeList, generateGradeId };
