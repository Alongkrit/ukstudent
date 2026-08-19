async function testFullFlow() {
  const timestamp = Date.now();
  
  // 1. Fetch CSRF token
  const csrfRes = await fetch('http://localhost:3001/api/v1/auth/csrf');
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const csrfCookie = csrfRes.headers.get('set-cookie');
  console.log('1. Got CSRF token:', csrfToken);

  // 2. Test Student Flow
  console.log('\n--- TESTING STUDENT FLOW ---');
  const studentEmail = `student_${timestamp}@university.ac.uk`;
  const studentReg = await fetch('http://localhost:3001/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
      'cookie': csrfCookie || '',
    },
    body: JSON.stringify({
      email: studentEmail,
      password: 'password123',
      role: 'student',
      fullName: 'Alice Student',
      university: 'University of Manchester',
      course: 'Computer Science',
      yearOfStudy: 'Second-Year',
    }),
  });
  console.log('Student Register HTTP Status:', studentReg.status);
  const studentRegData = await studentReg.json();
  console.log('Student Register Response:', studentRegData);

  const studentLogin = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify({ email: studentEmail, password: 'password123' }),
  });
  console.log('Student Login HTTP Status:', studentLogin.status);
  const studentLoginData = await studentLogin.json();
  console.log('Student Login Response:', studentLoginData);

  const studentMe = await fetch('http://localhost:3001/api/v1/users/me', {
    headers: { 'Authorization': `Bearer ${studentLoginData.accessToken}` },
  });
  console.log('Student /users/me HTTP Status:', studentMe.status);
  const studentMeData = await studentMe.json();
  console.log('Student /users/me Response:', studentMeData);

  // 3. Test Expert Flow
  console.log('\n--- TESTING EXPERT FLOW ---');
  const expertEmail = `expert_${timestamp}@university.ac.uk`;
  const expertReg = await fetch('http://localhost:3001/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
      'cookie': csrfCookie || '',
    },
    body: JSON.stringify({
      email: expertEmail,
      password: 'password123',
      role: 'expert',
      fullName: 'Dr. Bob Expert',
      subjects: ['Assignment Help', 'Dissertation Guidance'],
      qualifications: 'PhD Mathematics',
      bio: 'Experienced tutor',
      paypalEmail: expertEmail,
    }),
  });
  console.log('Expert Register HTTP Status:', expertReg.status);
  const expertRegData = await expertReg.json();
  console.log('Expert Register Response:', expertRegData);

  const expertLogin = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify({ email: expertEmail, password: 'password123' }),
  });
  console.log('Expert Login HTTP Status:', expertLogin.status);
  const expertLoginData = await expertLogin.json();
  console.log('Expert Login Response:', expertLoginData);

  const expertMe = await fetch('http://localhost:3001/api/v1/users/me', {
    headers: { 'Authorization': `Bearer ${expertLoginData.accessToken}` },
  });
  console.log('Expert /users/me HTTP Status:', expertMe.status);
  const expertMeData = await expertMe.json();
  console.log('Expert /users/me Response:', expertMeData);

  if (studentMe.status === 200 && expertMe.status === 200) {
    console.log('\n✅ ALL AUTHENTICATION AND /users/me FLOWS PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ FLOW FAILED!');
  }
}

testFullFlow();
