console.log('🔍 Finding your Supabase project...\n');

console.log('📋 Steps to find your correct project reference:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Look at the URL in your browser');
console.log('3. It should look like: https://supabase.com/dashboard/project/[PROJECT_REF]');
console.log('4. The [PROJECT_REF] is your project reference');
console.log('\n5. Or look at your project list - each project shows its reference');
console.log('\n6. Once you find the correct reference, update your connection string:');
console.log('   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres');

console.log('\n🔧 Common issues:');
console.log('- Project might be paused (check dashboard)');
console.log('- Project reference might be different');
console.log('- Password might need URL encoding');
console.log('- Network restrictions might be blocking connections');

console.log('\n📞 If you need help:');
console.log('- Check Supabase status: https://status.supabase.com/');
console.log('- Contact Supabase support if project is missing'); 