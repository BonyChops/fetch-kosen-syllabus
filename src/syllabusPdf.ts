import { PromisePool } from '@supercharge/promise-pool';
import axios from 'axios';
import path from 'path';
import { syllabusPdf } from './syllabusUrl';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import fs from 'fs';
import PDFMerger from 'pdf-merger-js';
import moment from 'moment';
import { Subject } from './types';

function getFileName(contentDisposition: string) {
    let fileName = contentDisposition.substring(
        // eslint-disable-next-line quotes
        contentDisposition.indexOf('\'\'') + 2,
        contentDisposition.length
    );
    fileName = decodeURI(fileName).replace(/\+/g, ' ');

    return fileName;
}

async function downloadAllSyllabusPDF(
    schoolId: string,
    departmentId: string,
    dirPath: string,
    subjects: Subject[]
) {
    async function fetchAndSavePDF(subjectId: string, actualYear: string) {
        const url = new URL(syllabusPdf);
        const query = url.searchParams;
        query.set('school_id', schoolId);
        query.set('department_id', departmentId);
        query.set('year', actualYear);
        query.set('subject_id', subjectId);
        query.set('preview', 'False');
        query.set('attachment', 'true');
        const response = await axios.get(url.toString(), {
            responseType: 'arraybuffer'
        });
        const buffer = Buffer.from(response.data, 'binary');

        const contentDisposition = response.headers['content-disposition'] as string;
        const fileName = getFileName(contentDisposition);

        const filepath = path.join(dirPath, fileName);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    }

    const bar = new cliProgress.SingleBar({
        format:
            'ダウンロード中... |' +
            colors.cyan('{bar}') +
            '| {percentage}% || {value}/{total} 完了',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    bar.start(subjects.length, 0, {
        speed: 'N/A'
    });
    const { results, errors } = await PromisePool.for(subjects).process(
        async (subject) => {
            const r = await fetchAndSavePDF(subject.id, subject.actualYear);
            bar.increment();
            return r;
        }
    );
    bar.stop();
    return { results, errors };
}

async function margeAllPdf(filePaths: string[], dirPath: string) {
    const merger = new PDFMerger();

    for (const file of filePaths) {
        await merger.add(file);
    }

    const filepath = path.join(
        dirPath,
        `marged-syllabus-${moment(new Date()).format(
            'YYYY-MM-DD-hh-mm-ss'
        )}.pdf`
    );
    await merger.save(filepath);
}

export { downloadAllSyllabusPDF, margeAllPdf };
