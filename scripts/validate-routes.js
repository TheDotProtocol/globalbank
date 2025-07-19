#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to check if a file is empty or malformed
function validateRouteFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file is empty or only contains whitespace
    if (!content.trim()) {
      return { valid: false, error: 'File is empty or contains only whitespace' };
    }
    
    // Check if file has proper TypeScript imports
    if (!content.includes('import') && !content.includes('export')) {
      return { valid: false, error: 'File missing imports or exports' };
    }
    
    // Check if file has proper Next.js route structure
    if (!content.includes('NextRequest') && !content.includes('NextResponse')) {
      return { valid: false, error: 'File missing Next.js route structure' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: `File read error: ${error.message}` };
  }
}

// Function to find all route.ts files
function findRouteFiles(dir) {
  const routeFiles = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item === 'route.ts') {
        routeFiles.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return routeFiles;
}

// Main validation function
function validateAllRoutes() {
  console.log('🔍 Validating all route files...\n');
  
  const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
  const routeFiles = findRouteFiles(apiDir);
  
  let validCount = 0;
  let invalidCount = 0;
  const invalidFiles = [];
  
  for (const filePath of routeFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    const result = validateRouteFile(filePath);
    
    if (result.valid) {
      console.log(`✅ ${relativePath}`);
      validCount++;
    } else {
      console.log(`❌ ${relativePath} - ${result.error}`);
      invalidCount++;
      invalidFiles.push({ path: filePath, error: result.error });
    }
  }
  
  console.log(`\n📊 Validation Results:`);
  console.log(`✅ Valid files: ${validCount}`);
  console.log(`❌ Invalid files: ${invalidCount}`);
  
  if (invalidFiles.length > 0) {
    console.log(`\n🚨 Invalid files found:`);
    invalidFiles.forEach(file => {
      console.log(`   - ${path.relative(process.cwd(), file.path)}: ${file.error}`);
    });
    process.exit(1);
  } else {
    console.log(`\n🎉 All route files are valid!`);
  }
}

// Run validation
validateAllRoutes(); 