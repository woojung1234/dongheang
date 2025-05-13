// scripts/fixIndexes.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function fixIndexes() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB에 연결되었습니다.');
    
    // 현재 컬렉션의 인덱스 정보 출력
    const userIndexes = await mongoose.connection.collection('users').indexes();
    console.log('User 컬렉션 인덱스:', userIndexes);
    
    // kakaoId 인덱스 삭제 (있는 경우)
    if (userIndexes.some(index => index.name === 'kakaoId_1')) {
      console.log('kakaoId_1 인덱스를 삭제합니다...');
      await mongoose.connection.collection('users').dropIndex('kakaoId_1');
      console.log('kakaoId_1 인덱스가 삭제되었습니다.');
    } else {
      console.log('kakaoId_1 인덱스가 없습니다.');
    }
    
    // 스파스 인덱스로 재생성 (선택사항)
    console.log('kakaoId에 새로운 스파스 인덱스를 생성합니다...');
    await mongoose.connection.collection('users').createIndex(
      { kakaoId: 1 }, 
      { sparse: true, background: true }
    );
    console.log('kakaoId 스파스 인덱스가 생성되었습니다.');
    
    // 변경 후 인덱스 다시 확인
    const updatedIndexes = await mongoose.connection.collection('users').indexes();
    console.log('업데이트된 인덱스:', updatedIndexes);
    
    console.log('인덱스 수정이 완료되었습니다.');
  } catch (error) {
    console.error('인덱스 수정 중 오류 발생:', error);
  } finally {
    // 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
fixIndexes();
