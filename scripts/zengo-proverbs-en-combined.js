/**
 * 영어 교육적 명문장/명언/속담 데이터 (모든 난이도)
 * 
 * 이 파일은 MongoDB의 zengo 컬렉션에 추가할 교육적 가치가 높은
 * 영어 명언과 속담을 포함합니다.
 * 
 * - 중복 단어 없음
 * - 오버플로우 없음
 * - 교육적 가치 높음
 */

const zengoProverbsEn3x3 = require('./zengo-proverbs-en-3x3.js');
const zengoProverbsEn5x5 = require('./zengo-proverbs-en-5x5.js');
const zengoProverbsEn7x7 = require('./zengo-proverbs-en-7x7.js');

// 모든 영어 속담 데이터 합치기
const zengoProverbsEnCombined = [
  ...zengoProverbsEn3x3,
  ...zengoProverbsEn5x5,
  ...zengoProverbsEn7x7
];

module.exports = zengoProverbsEnCombined; 