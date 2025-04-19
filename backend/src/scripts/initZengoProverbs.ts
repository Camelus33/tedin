import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ZengoProverbContent from '../models/ZengoProverbContent';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';

// ====== 입력 데이터 ======
const EN_3x3 = [
  "Rise and glow.","Work with zest.","Seek new hope.","Gain more grit.","Try each day.","Push past fear.","Keep on going.","Grow your mind.","Plan and act.","Live with joy.","Earn your keep.","Stay true now.","Read and grow.","Aim for more.","Seek wide view.","Earn new goal.","Heal and rise.","Grow from hurt.","Walk your path.","Take each step.","Mind your pace.","Dare to try.","Open new doors.","Stay so bold.","Grow your will.","Heal your soul.","Seek real path.","Push your limit.","Aim so high.","Try then learn.","Give more care.","Stay on task.","Own your voice.","Work with pride.","Earn sunny days.","Keep on track.","Look then leap.","Take wise aim.","Calm your mind.","Grow your grace."
];
const EN_5x5 = [
  "Small steps yield big daily gains.","Train often for real sharp mind.","Trust your grit and push ahead.","Never doubt your deep inner power.","Press on and reach new goals.","Brave souls forge swift clear wins.","Learn daily and guard stout hope.","Share kind acts for loyal bonds.","Study often to grow calm mind.","Focus tight and chase clear aims.","Align each deed with grand plan.","Honor your pace to find peace.","Think big then shape daily acts.","Watch small seeds grow tall hopes.","Solid steps forge your bold path.","Early study fuels sure mind power.","Seek fresh views and shift worry.","Spark big hope via kind deeds.","Rest well then face tough tasks.","Judge less and hold calm sense.","Purge doubt with brisk daily acts.","Guide your heart and trust faith.","Grasp each offer and keep cool.","Push daily steps to earn pride.","Small gains lead to large wins.","Alert mind spots ways to grow.","Steer your work and guard peace.","Train daily skill for sure gains.","Check each fear then find might.","Seek wise tips and test them.","Watch your mood and guard time.","Craft your aim with grand care.","Adapt quick and chase sunny days.","Shape calm mind for daily peace.","Think less fear adopt new tasks.","Brisk moves guard your bold soul.","Honor each voice and spark union.","Forge stout will to block doubt.","Prime your skill and chase luck.","Value each step and stand proud."
];
const EN_7x7 = [
  "Truly stand with hope and guard your will.","Never cease to learn and mold your grit.","Grow your skill then push past each limit.","Shape each day with faith and calm soul.","Stand firm when doubt tries your alert mind.","Early tasks forge stout base for your goals.","Carry deep faith and chase bold daily aims.","Trust your path then climb each rung well.","Solid work hones your mind and forms truth.","Guide each sense, then stand by pure goals.","Value each loss and glean new sharp skill.","Calm your soul then open wise daily doors.","Learn quick logic to shape bold world now.","Might grows when sharp focus aids daily deeds.","Press ahead with calm heart and wide grin.","Honor each vow, then watch your might bloom.","Judge less haste and open your wise mind.","Early steps push you past worry or gloom.","Trial shows grit when fate looks quite grim.","Grow calm skill and serve your stout code.","Trust big goals then shape your life arc.","Align your acts with moral sense each day.","Never bow down, truly hold dear hope now.","Small seeds spark large waves of calm shift.","Judge your load then find solid sharp base.","Think ahead and chase each goal with zeal.","Calm fear first, then learn ways to grow.","Forge new links and share true daily cheer.","Guide your mind yet heed each wise clue.","Early moves breed bold gains and fresh view.","Steer each hour, then claim your dream loud.","Teach wise acts that spark trust and care.","Check your base, then shift gloom to light.","Honor pure truth and guide each small step.","Calm your drive when winds test bold grace.","Urge new aims and shape your daily story.","Tiny tries stack into firm moral posts now.","Keep fresh goals alive and yield calm cheer.","Grant your time to learn keen daily tips.","Boost your vibe, then mold real stout bonds."
];
const KO_3x3 = [
  "포기 하지 마.","오늘 다시 시작.","희망 품고 전진.","끝까지 꿈을 붙잡자.","매일 앞으로 나아가자.","실패와 두려움을 이겨내자.","내일 향해 도전하자.","절대 뒤로 도망가지 마라.","모든 걸음이 귀중하다.","오늘은 단 한번의 기회.","마음의 태엽을 감아라.","주저않지 말고 다시 일어나.","가슴 속 꿈을 펼쳐보자.","넘어져도 다시 일어서.","도전해서 오늘을 바꿔.","헤맨만큼 내 땅이다.","언제나 난 자신 있다.","늘 새로운 아침이다.","성공 뒤엔 진한 땀있다.","부딪혀야 가능성을 찾는다.","자신의 한계를 시험해.","희망은 나아게 에너자이저.","두드리고 힘차게 열어 젖혀.","두려움 떨치고 나아가라.","중단해도 기 죽지마.","노력하면 결국 해낸다.","천천히 가도 언젠간 도착한다.","말보다 행동 우선이다.","습관 바뀌면 운명 달라진다.","꾸준함이 결실을 만든다.","끝까지 달리면 결승선 보인다.","지금 미루면 주저않는 거야.","해보는 건 없어. 그냥해.","온 진심을 담아 노력해.","더 높은 곳을 봐.","가슴열고 큰 길로 가라.","실수는 실패가 아니다.","결심하라 그러면 성공한다.","더디지만 그래도 전진해.","열정으로 너를 충전해."
];
const KO_5x5 = [
  "작은 노력들이 결국 크게 빛을 발한다.","희망 품으면 무거운 마음조차 가볍게 변한다.","실패 겪어도 다시 일어나 꿈을 찾자.","지식 쌓으면 내일의 도약대가 훨씬 강해진다.","두려움 떨치고 한계를 넘어서는 끈기부터 길러보자.","꾸준한 습관이 변화를 큰 열매로 바꾼다.","매일 배우며 자신감을 키우는 자세가 필요하다.","끝까지 집중하면 언젠간 원하는 목표에 도달한다.","배움 속에서 새로운 아이디어를 끊임없이 추구해보자.","순간을 놓치면 사라지니 지금 당장 움직여.","작게 시작해도 꾸준하면 엄청난 결과를 만든다.","목표 세우고 틀림없이 지켜내는 자세를 가지자.","긍정적 태도가 인생에 놀라운 변화를 준다.","실수 해도 도전하면 결국 문이 열린다.","아무리 힘들어도 버티면 극적인 변화 온다.","즐겁게 배울수록 습득이 빨라지고 실력 향상된다.","노력 모이면 미래가 스스로 달라진다.","위기가 와도 도전으로 뛰어넘을 수 있다.","내면이 강하면 위기는 작아진다.","안전지대 떠나야 진정한 역량 확인 가능하다.","실패 경험은 더 넓은 지혜로 이끈다.","매 순간 최선 다해 길을 찾자.","느린 걸음에도 꾸준하면 반드시 성공한다.","아무도 못한 일이라도 내가 먼저 해보자.","보이지 않아도 믿음 품고 시도해보자.","뚜렷한 목표가 큰 성공을 만든다..","실천 없는 바람은 이야기 될 뿐이다.","스스로 결단하고 운명을 바꾸는 용기 지니자.","감정 정리하면 머릿속 맑아지고 기회 보인다.","장벽 넘어서는 사람에겐 무한한 가능성 온다.","끝없이 시도하면 끝까지 가닿을 수 있다.","서두르지 말되 꾸준히 달리면 결실 맺는다.","작은 시도가 모이면 언제나 큰 성공이 온다.","한계를 인정하고 극복하는 지식을 배워라","변명 접고 새롭게 재도전하며 시야 넓히자.","포기의 순간이 가장 위험함을 스스로 명심하자.","마음 속에 있는 과거의 실수를 태워버려.","남의 말 중에 필요한 말만 새겨.","지금 이 순간만이 확실한 진실이야.","불안해 하지마 그냥 마음속 환상이야."
];
const KO_7x7 = [
  "작은 노력들이 커다란 변화로 이어지며 새로운 문을 연다.","포기하지 않는 정신이 운명을 바꾸고 인생을 빛나게 만든다.","한 걸음씩 전진하며 역경 속에서도 단단한 기반을 다진다.","실패해도 다시 도전하면 한계를 넘어서 더 높이 오른다.","간절한 목표 품고 매일 실행하며 기적의 씨앗을 키우자.","희망 깃든 긍정으로 마주하면 거친 장애도 작게 보인다.","마음 단단히 붙잡으면 흔들리는 상황도 버텨낼 힘이 생긴다.","느린 진전이지만 꾸준히 쌓이면 놀라운 변화로 이어진다.","결심 확실히 세우고 의지 다지면 어떤 길도 뚫린다.","끊임없이 배우고 도전하니 새로운 기회가 활짝 열리게 된다.","작은 승리 모으면 결국 큰 성공으로 가는 길이 열린다.","눈앞 현실에 굴하지 말고 더 멀리 내다보며 준비하자.","진정한 성장 위해 실수를 인정하고 개선하는 자세를 가져라.","두려움 속에서도 희망 찾으며 스스로 강함을 증명해보자.","게으름 떨쳐내고 새로운 지평 향해 오늘부터 움직이자.","최선 다한 노력은 절대로 배신하지 않는 귀한 자산이다.","인내하며 노력한 시간이 인생 전반을 꽃피우는 토대가 된다.","결코 빠른 길만이 옳지 않음을 느리게 가면서 깨닫는다.","작은 아이디어도 실행하면 세상을 조금씩 바꿀 수 있다.","희망의 불씨를 지키면 절망 또한 더이상 커지지 않는다.","방해 요소 넘어 꾸준히 매달리면 한계를 새로 쓸 수 있다.","실천 단계 밟아가며 구체적 변화를 현실로 만들어내자.","더 먼 미래 그리며 오늘 할 일부터 성실히 마치자.","내적 동기 강화해 하루하루 성과를 키워내는 길을 걷자.","실패에도 굴하지 않고 의지를 붙들면 길은 확장된다.","성공 확률은 결코 운이 아닌 꾸준한 실천에서 비롯된다.","낙담보다 가능성 보며 배움 채우고 앞으로 더 나아가자.","자기 믿음이 곧 동력이 되어 커다란 변혁을 일으킨다.","경험 통해 얻게 된 지혜가 인생 방향 크게 바꿔준다.","초조해 말고 두 발로 버티며 천천히 목표 향해 가자.","한 번의 시도라도 쌓이면 놀라운 기회를 열어준다.","흔들려도 멈추지 않으면 마침내 빛나는 결실이 온다.","삶의 역경 속에서도 흔들림 적은 마음가짐을 기르자.","마음을 비우고 본질을 파악하면 불필요한 걱정이 사라진다.","끈기 가진 자는 아무리 험한 길도 끝내 헤쳐나간다.","현재 역량보다 조금 높은 목표가 성장을 부추긴다.","작은 다짐 모아 일상의 의욕으로 재탄생 시킬 수 있다.","불안감 내려놓고 현실에 최선 다하면 길이 열린다.","인생의 무거운 과제도 꾸준한 발걸음으로 정복 가능하다.","의미 있는 고난 겪으며 자기 한계를 점차 확장해보자."
];

const LEVELS = [
  { arr: EN_3x3, language: 'en', level: '3x3-easy', boardSize: 3, min: 3, max: 4 },
  { arr: EN_5x5, language: 'en', level: '5x5-medium', boardSize: 5, min: 5, max: 6 },
  { arr: EN_7x7, language: 'en', level: '7x7-hard', boardSize: 7, min: 7, max: 8 },
  { arr: KO_3x3, language: 'ko', level: '3x3-easy', boardSize: 3, min: 3, max: 4 },
  { arr: KO_5x5, language: 'ko', level: '5x5-medium', boardSize: 5, min: 5, max: 6 },
  { arr: KO_7x7, language: 'ko', level: '7x7-hard', boardSize: 7, min: 7, max: 8 },
];

function getWordLength(word: string, lang: string) {
  if (lang === 'ko') {
    // 한글: 음절(글자) 단위로 길이 체크
    return Array.from(word.replace(/[^\uAC00-\uD7A3\w]/g, "")).length;
  } else {
    // 영어: 알파벳 기준
    return word.replace(/[^a-zA-Z]/g, "").length;
  }
}

(async () => {
  await mongoose.connect(MONGODB_URI);
  await ZengoProverbContent.deleteMany({});
  let totalInserted = 0;
  for (const { arr, language, level, boardSize, min, max } of LEVELS) {
    let inserted = 0;
    for (const text of arr) {
      // 문장 끝의 마침표 등 제거 후 단어 분리
      const words = text.trim().replace(/[.?!]$/, '').split(/\s+/);
      if (words.length < min || words.length > max) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => getWordLength(w, language) > 5)) continue;
      const wordMappings = words.map((word, idx) => ({ word, coords: { x: idx, y: 0 } }));
      const doc = new ZengoProverbContent({
        proverbText: text,
        language,
        level,
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: boardSize === 3 ? 8 : boardSize === 5 ? 15 : 25,
        initialDisplayTimeMs: 4000,
        targetTimeMs: 30000,
        goPatternName: 'Basic Pattern',
      });
      await doc.save();
      inserted++;
      totalInserted++;
    }
    console.log(`[${language}][${level}] 업로드: ${inserted}개`);
  }
  console.log(`전체 업로드 완료: ${totalInserted}개`);
  await mongoose.disconnect();
  process.exit(0);
})(); 