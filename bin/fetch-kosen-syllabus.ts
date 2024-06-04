#!/usr/bin/env node

import { fetchSchoolList, promptSchoolList } from '../src/school';
import { getArgs, generateCommandLine } from '../src/args';
import { loadFunc } from '../src/loading';
import { fetchDepartmentSyllabus } from '../src/syllabus';
import { fetchYearList, promptYearList } from '../src/year';
import { syllabusUrl } from '../src/syllabusUrl';
import inquirer from 'inquirer';
import { downloadAllSyllabusPDF, margeAllPdf } from '../src/syllabusPdf';
import { promptGradeList, getGradeList } from '../src/grade';
import { Department, Grade, Subject } from '../src/types';

import { fetchDepartmentList, promptDepartmentList } from '../src/department';
import { getSubjectsFromSyllabus, promptSubjectList } from '../src/subject';

function onExitMessage(args: ReturnType<typeof getArgs>) {
    console.log('\n続きから実行するには，下記のコマンドを実行してください．\n');
    console.log(`❯ ${generateCommandLine(args)}`);

    process.exit();
}

(async () => {
    let args = getArgs();
    process.on('SIGINT', function() {
        onExitMessage(args);
    });

    process.stdin.on('data', (key) => {
        if (key.toString() == '\u0003') {
            onExitMessage(args);
        }
    });

    const schools = await loadFunc(
        fetchSchoolList,
        `${new URL(syllabusUrl).hostname}に接続しています...`
    );
    let school = schools.find((v) => v.id === args.schoolId);
    if (args.schoolId && school) {
        console.log(`学校: ${school.name}(${school.id})`);
    } else {
        school = await promptSchoolList(schools);
        args['school-id'] = school?.id ?? undefined;
    }

    if (!school) {
        throw new Error('School not specified.');
    }

    const departments = await loadFunc(
        (): Promise<Department[]> => fetchDepartmentList(school.id),
        `${new URL(syllabusUrl).hostname}に接続しています...`
    );
    let department = departments.find((v) => v.id === args.departmentId);
    if (args.departmentId && department) {
        console.log(`学科: ${department.name}(${department.id})`);
    } else {
        department = await promptDepartmentList(departments);
        args['department-id'] = department?.id ?? undefined;
    }

    if (!department) {
        throw new Error('Department not specified.');
    }

    const years = await loadFunc(
        () => fetchYearList(school.id, department.id),
        `${new URL(syllabusUrl).hostname}に接続しています...`
    );
    let year = years.find((v) => v.id === args.year);

    if (args.year && year) {
        console.log(`年度: ${year.name}(${year.id})`);
    } else {
        year = await promptYearList(years);
        args.year = year?.id ?? undefined;
    }

    if (!year) {
        throw new Error('Year not specified.');
    }

    const syllabus = await loadFunc(
        () => fetchDepartmentSyllabus(school.id, department.id, year.id),
        `${new URL(syllabusUrl).hostname}に接続しています...`
    );

    const gradeCandidates = getGradeList(syllabus);
    let grades: Grade[];
    if (
        args.grades &&
        args.grades.some((v) => gradeCandidates.map((v) => v.id).includes(String(v)))
    ) {
        grades = gradeCandidates.filter((v) => args.grades?.includes(v.id));
        console.log(
            `年度: ${grades
                .map((v) => `${v.grade} ${v.semester}期 (${v.id})`)
                .join(', ')}`
        );
    } else {
        grades = await promptGradeList(gradeCandidates);
        args.grades = grades.map((v) => v.id);
    }

    const subjectCandidates = getSubjectsFromSyllabus(syllabus).map((v) => ({
        ...v,
        checked: grades
            .map((v) => v.id)
            .some((grade) => v.grades.includes(grade))
    }));
    let subjects: Subject[];
    if (
        (args.additionalSubjects && args.additionalSubjects?.length > 0) || (args.excludeSubjects && args.excludeSubjects?.length > 0)
    ) {
        if (!args.additionalSubjects?.[0]) {
            subjects = subjectCandidates.filter((v) => v.checked);
        } else {
            subjects = subjectCandidates.filter(
                (v) =>
                    (v.checked || args.additionalSubjects?.includes(v.id)) &&
                    !args.excludeSubjects?.includes(v.id)
            );
        }
        console.log(
            `科目: ${subjects.map((v) => `${v.name}(${v.id})`).join(', ')}`
        );
    } else {
        subjects = await promptSubjectList(subjectCandidates);
        const additionalSubjects = subjects
            .filter(
                (v) => !subjectCandidates?.find((vv) => vv?.id === v?.id)?.checked
            )
            .map((v) => v.id);
        if (additionalSubjects.length > 0) {
            args['additional-subjects'] = additionalSubjects;
        }
        const excludeSubjects = subjectCandidates
            .filter((v) => v.checked && !subjects.find((vv) => v.id === vv.id))
            .map((v) => v.id);
        if (excludeSubjects.length > 0) {
            args['exclude-subjects'] = excludeSubjects;
        }
    }

    let confirmed = !args.prompt;
    if (args.prompt) {
        confirmed = (
            await inquirer.prompt({
                type: 'confirm',
                name: 'confirm',
                message:
                    '選択された内容でダウンロードを開始します．よろしいですか？'
            })
        ).confirm;
    }

    if (!confirmed) {
        onExitMessage(args);
    }

    const { results: files, errors } = await downloadAllSyllabusPDF(
        school.id,
        department.id,
        args.path as string,
        subjects
    );

    await loadFunc(
        () => margeAllPdf(files, args.path as string),
        'PDFを結合しています...'
    );

    if (errors.length > 0) {
        console.log('ダウンロード時にエラーが発生しました');
        errors.forEach((e) => {
            console.error(e);
        });
        onExitMessage(args);
    }

    console.log('完了．');
    process.exit(0);
})();
