// scripts/update-auth-routes.js
// Automatically updates API routes to use direct JWT verification

const fs = require('fs');
const path = require('path');

// Check for dry run flag
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
} else {
  console.log('⚠️  LIVE MODE - Files will be modified!\n');
}

// List of files to update
const filesToUpdate = [
  'app/api/user/dashboard-stats/route.ts',
  'app/api/rentals/user-bookings/route.ts',
  'app/api/guest/messages/reply/route.ts',
  'app/api/guest/messages/route.ts',
  'app/api/guest/profile-status/route.ts',
  'app/api/guest/profile/route.ts',
  'app/api/guest/profile/documents/route.ts',
  'app/api/guest/profile/photo/route.ts',
  'app/api/guest/appeal-notifications/route.ts',
  'app/api/guest/insurance/route.ts',
  'app/api/guest/reviews/route.ts',
];

// Import statement to add
const importStatement = `import { verifyRequest } from '@/app/lib/auth/verify-request'`;

console.log('🔧 Starting bulk auth route updates...\n');

let wouldUpdateCount = 0;
let alreadyUpdatedCount = 0;
let failedFiles = [];
let changesPreview = [];

filesToUpdate.forEach((filePath) => {
  const fullPath = path.join(process.cwd(), filePath);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    failedFiles.push({ file: filePath, reason: 'File not found' });
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    let modified = false;

    // Check if already updated
    if (content.includes('verifyRequest')) {
      console.log(`✅ ${filePath} - Already updated, skipping`);
      alreadyUpdatedCount++;
      return;
    }

    // Pattern 1: dashboard-stats style (with immediate error check)
    const pattern1 = /\/\/ Get authenticated user from centralized auth\s+const authResponse = await fetch\(`\$\{request\.nextUrl\.origin\}\/api\/auth\/verify`,[\s\S]*?\)\s+if \(!authResponse\.ok\)[\s\S]*?\}\s+const authData = await authResponse\.json\(\)\s+const userEmail = authData\.user\?\.email\s+const userId = authData\.user\?\.id\s+if \(!userEmail && !userId\)[\s\S]*?\}/;

    // Pattern 2: user-bookings style (separate variable declarations)
    const pattern2 = /const authResponse = await fetch\(`\$\{request\.nextUrl\.origin\}\/api\/auth\/verify`,[\s\S]*?\)\s+let userEmail = null\s+let userId = null\s+if \(authResponse\.ok\) \{[\s\S]*?\}\s+[\s\S]*?if \(!userId && !userEmail\) \{[\s\S]*?\}/;

    // Pattern 3: Simple userId only
    const pattern3 = /const authResponse = await fetch\(`\$\{request\.nextUrl\.origin\}\/api\/auth\/verify`,[\s\S]*?\)\s+if \(!authResponse\.ok\)[\s\S]*?\}\s+const authData = await authResponse\.json\(\)\s+const userId = authData\.user\?\.id\s+if \(!userId\)[\s\S]*?\}/;

    let matchedPattern = null;
    let newCode = '';

    if (pattern1.test(content)) {
      matchedPattern = pattern1;
      newCode = `// Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id`;
      
    } else if (pattern2.test(content)) {
      matchedPattern = pattern2;
      newCode = `const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id
    console.log('Authenticated user via auth service:', userEmail)`;
      
    } else if (pattern3.test(content)) {
      matchedPattern = pattern3;
      newCode = `const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id`;
    }

    if (matchedPattern) {
      const oldMatch = content.match(matchedPattern);
      content = content.replace(matchedPattern, newCode);
      modified = true;

      // Add import if not present
      if (!content.includes("import { verifyRequest }")) {
        const importRegex = /^import .+ from .+$/gm;
        const imports = content.match(importRegex);
        
        if (imports && imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          content = content.replace(lastImport, `${lastImport}\n${importStatement}`);
        }
      }

      wouldUpdateCount++;
      console.log(`✅ ${filePath} - ${isDryRun ? 'WOULD BE updated' : 'Updated successfully'}`);
      
      if (isDryRun && oldMatch && changesPreview.length < 2) {
        changesPreview.push({
          file: filePath,
          oldCode: oldMatch[0].substring(0, 250),
          newCode: newCode.substring(0, 250)
        });
      }

      // Only write if not dry run
      if (!isDryRun) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    } else {
      console.log(`⚠️  ${filePath} - No auth pattern found (needs manual update)`);
      failedFiles.push({ file: filePath, reason: 'Pattern not matched' });
    }

  } catch (error) {
    console.log(`❌ ${filePath} - Error: ${error.message}`);
    failedFiles.push({ file: filePath, reason: error.message });
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n✅ ${isDryRun ? 'Would update' : 'Updated'}: ${wouldUpdateCount} files`);
console.log(`✅ Already updated: ${alreadyUpdatedCount} files`);
console.log(`⚠️  Needs manual update: ${failedFiles.length} files\n`);

if (failedFiles.length > 0) {
  console.log('Files needing manual update:');
  failedFiles.forEach(({ file, reason }) => {
    console.log(`  - ${file}`);
  });
  console.log('');
}

if (isDryRun && changesPreview.length > 0) {
  console.log('📝 PREVIEW OF CHANGES:');
  console.log('='.repeat(60));
  
  changesPreview.forEach((preview, index) => {
    console.log(`\n[${index + 1}] ${preview.file}\n`);
    console.log('OLD CODE:');
    console.log('─'.repeat(60));
    console.log(preview.oldCode + '...');
    console.log('\n↓↓↓ WILL BE REPLACED WITH ↓↓↓\n');
    console.log('NEW CODE:');
    console.log('─'.repeat(60));
    console.log(preview.newCode);
    console.log('');
  });
}

console.log('='.repeat(60));
console.log('\n🎯 Next steps:');
if (isDryRun) {
  console.log('1. Review the preview above');
  console.log('2. If looks good, run: node scripts/update-auth-routes.js');
  console.log('3. Manually update any remaining files');
} else {
  console.log('1. Review changes: git diff app/api/');
  console.log('2. Test dashboard: npm run dev');
  console.log('3. Manually update failed files (if any)');
  console.log('4. Commit: git add . && git commit -m "feat: optimize auth"');
}
console.log('');