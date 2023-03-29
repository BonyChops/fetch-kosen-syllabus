const inquirer = require('inquirer');

function getGradeList(syllabus) {
    const gradeCols = [];
    syllabus[0].forEach((element, i) => {
        if (element === '学年別週当授業時数') {
            gradeCols.push(i);
        }
    });
    const grades = gradeCols.map((v) => ({
        grade: syllabus[1][v],
        semester: syllabus[2][v],
        quoter: syllabus[3][v],
        id: generateGradeId(syllabus, v),
    }));
    return grades;
}

async function promptGradeList(grades) {
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

function generateGradeId(syllabus, colNum) {
    return `${syllabus[1][colNum].substring(
        0,
        syllabus[1][colNum].length - 1
    )}-${syllabus[3][colNum]}`;
}

module.exports = { getGradeList, promptGradeList, generateGradeId };
