import fs from 'fs';

const content = fs.readFileSync('c:/Users/Kripa Hanna Shiju/OneDrive/Documents/Min Project/hotel_food_ordering_system/src/app/admin/dashboard/page.tsx', 'utf8');

const regex = /\//g;
let match;
const matches = [];

while ((match = regex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length;
    const context = content.substring(Math.max(0, match.index - 20), Math.min(content.length, match.index + 20));
    matches.push({ index: match.index, line, context: context.replace(/\n/g, '\\n') });
}

fs.writeFileSync('c:/Users/Kripa Hanna Shiju/OneDrive/Documents/Min Project/hotel_food_ordering_system/src/app/brain/e8c656dd-e4de-4b05-b949-05842b9627b0/scratch/check_slash.json', JSON.stringify(matches, null, 2));
