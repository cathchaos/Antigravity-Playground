// scripts/update_roster.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URLs = [
    'https://www.thesmackdownhotel.com/roster/?promotion=wwe&show=face-heel',
    'https://www.thesmackdownhotel.com/roster/wwe/',
];

function generateId(name) {
    return Buffer.from(name.toLowerCase()).toString('base64').replace(/=+$/, '');
}

async function extractFromFaceHeel(html) {
    const $ = cheerio.load(html);
    const wrestlers = [];

    $('.card-position').each((_, cardPos) => {
        $(cardPos).find('.alignment.body').each((_, alignmentBody) => {
            let alignment = 'Neutral';
            if ($(alignmentBody).hasClass('face')) alignment = 'Face';
            if ($(alignmentBody).hasClass('heel')) alignment = 'Heel';
            if ($(alignmentBody).hasClass('tweener')) alignment = 'Tweener';

            $(alignmentBody).find('ul.wrestlers-list li a').each((_, a) => {
                const name = $(a).find('.roster_name').text().trim();
                if (!name) return;

                const rosterDiv = $(a).find('.roster');
                let brand = 'Unknown';
                if (rosterDiv.hasClass('brand-raw')) brand = 'RAW';
                else if (rosterDiv.hasClass('brand-smackdown')) brand = 'SmackDown';
                else if (rosterDiv.hasClass('brand-nxt')) brand = 'NXT';

                const imageUrl = $(a).find('img:not(.championship):not(.icon-image)').attr('src');

                let status = 'Active';
                const iconImg = $(a).find('.icon-image');
                if (iconImg.length > 0) {
                    const titleAtt = iconImg.attr('title') || '';
                    if (titleAtt.toLowerCase().includes('injured')) status = 'Injured';
                    if (titleAtt.toLowerCase().includes('inactive')) status = 'Inactive';
                }

                const title = $(a).find('.championship').attr('title') || '';

                wrestlers.push({
                    id: generateId(name),
                    name,
                    brand,
                    alignment,
                    status,
                    title,
                    image_url: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : 'https://www.thesmackdownhotel.com' + imageUrl) : null
                });
            });
        });
    });

    return wrestlers;
}

async function extractFromFullRoster(html) {
    const $ = cheerio.load(html);
    const wrestlers = [];

    $('.roster_section a').each((_, a) => {
        const name = $(a).find('.roster_name').text().trim();
        if (!name) return;

        const rosterDiv = $(a).find('.roster');
        let brand = 'Unknown';
        if (rosterDiv.hasClass('brand-raw')) brand = 'RAW';
        else if (rosterDiv.hasClass('brand-smackdown')) brand = 'SmackDown';
        else if (rosterDiv.hasClass('brand-nxt')) brand = 'NXT';

        const imageUrl = $(a).find('img:not(.championship):not(.icon-image)').attr('src');

        let status = 'Active';
        const iconImg = $(a).find('.icon-image');
        if (iconImg.length > 0) {
            const titleAtt = iconImg.attr('title') || '';
            if (titleAtt.toLowerCase().includes('injured')) status = 'Injured';
            if (titleAtt.toLowerCase().includes('inactive')) status = 'Inactive';
            if (titleAtt.toLowerCase().includes('announcer')) status = 'Staff';
        }

        wrestlers.push({
            id: generateId(name),
            name,
            brand,
            status,
            image_url: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : 'https://www.thesmackdownhotel.com' + imageUrl) : null
        });
    });

    return wrestlers;
}

async function main() {
    try {
        console.log('Fetching Face/Heel roster...');
        const faceHeelRes = await fetch(URLs[0]);
        const faceHeelHtml = await faceHeelRes.text();
        const faceHeelWrestlers = await extractFromFaceHeel(faceHeelHtml);
        console.log(`Found ${faceHeelWrestlers.length} from Face/Heel page.`);

        console.log('Fetching Full roster...');
        const fullRes = await fetch(URLs[1]);
        const fullHtml = await fullRes.text();
        const fullWrestlers = await extractFromFullRoster(fullHtml);
        console.log(`Found ${fullWrestlers.length} from Full roster page.`);

        // Merge: use faceHeel info as base, supplement with full roster for anyone missing
        const rosterMap = new Map();

        faceHeelWrestlers.forEach(w => rosterMap.set(w.id, w));

        fullWrestlers.forEach(w => {
            if (rosterMap.has(w.id)) {
                // Update brand if it was unknown
                const existing = rosterMap.get(w.id);
                if (existing.brand === 'Unknown' && w.brand !== 'Unknown') {
                    existing.brand = w.brand;
                }
                // Update status if it's more specific
                if (existing.status === 'Active' && w.status !== 'Active') {
                    existing.status = w.status;
                }
            } else {
                rosterMap.set(w.id, { ...w, alignment: 'Neutral' });
            }
        });

        const finalRoster = Array.from(rosterMap.values())
            .filter(w => ['RAW', 'SmackDown', 'NXT'].includes(w.brand))
            .filter(w => w.status !== 'Staff'); // Filter out purely staff if desired

        const outPath = path.resolve(__dirname, '../src/data/roster.json');
        fs.writeFileSync(outPath, JSON.stringify(finalRoster, null, 2), 'utf-8');
        console.log(`Successfully wrote ${finalRoster.length} wrestlers to ${outPath}`);
    } catch (err) {
        console.error('Error updating roster:', err);
        process.exit(1);
    }
}

main();
