export interface CountryRule {
  code: string;
  name: string;
  patterns: string[];
}

const COUNTRY_RULES: CountryRule[] = [
  { code: 'RU', name: 'Россия', patterns: ['москва', 'санкт-петербург', 'питер', 'краснодар', 'уфа', 'казань', 'сочи', 'домбай', 'грозный', 'махачкала', 'дербент', 'сулак', 'сарыкум', 'гуниб', 'хунзах', 'кубачи', 'карадах', 'байкал', 'владивосток', 'мурманск', 'новосибирск', 'геленджик', 'таганай', 'шерегеш', 'хибины', 'алтай'] },
  { code: 'FR', name: 'Франция', patterns: ['франц', 'париж', 'бордо'] },
  { code: 'IT', name: 'Италия', patterns: ['итал', 'рим', 'флоренц', 'тоскан'] },
  { code: 'ES', name: 'Испания', patterns: ['испан', 'барселон', 'мадрид', 'севиль', 'валенси'] },
  { code: 'PT', name: 'Португалия', patterns: ['португал', 'лиссабон', 'порту'] },
  { code: 'NL', name: 'Нидерланды', patterns: ['амстердам', 'нидерланд'] },
  { code: 'GB', name: 'Великобритания', patterns: ['великобрит', 'лондон', 'эдинбург'] },
  { code: 'DE', name: 'Германия', patterns: ['герман', 'берлин'] },
  { code: 'IS', name: 'Исландия', patterns: ['исланд', 'рейкьявик'] },
  { code: 'DK', name: 'Дания', patterns: ['дания', 'копенгаген'] },
  { code: 'NO', name: 'Норвегия', patterns: ['норвег', 'осло'] },
  { code: 'BY', name: 'Беларусь', patterns: ['беларус', 'минск'] },
  { code: 'CZ', name: 'Чехия', patterns: ['чех', 'праг'] },
  { code: 'HU', name: 'Венгрия', patterns: ['венгр', 'будапешт'] },
  { code: 'AT', name: 'Австрия', patterns: ['австри', 'вена'] },
  { code: 'LV', name: 'Латвия', patterns: ['рига', 'латви'] },
  { code: 'LT', name: 'Литва', patterns: ['вильнюс', 'литв'] },
  { code: 'TR', name: 'Турция', patterns: ['турц', 'стамбул', 'анталья', 'босфор'] },
  { code: 'GE', name: 'Грузия', patterns: ['грузи', 'тбилиси'] },
  { code: 'JO', name: 'Иордания', patterns: ['иордан', 'петра'] },
  { code: 'EG', name: 'Египет', patterns: ['егип', 'гиза'] },
  { code: 'SA', name: 'Саудовская Аравия', patterns: ['саудов', 'аль-ула'] },
  { code: 'IR', name: 'Иран', patterns: ['иран', 'исфахан'] },
  { code: 'KZ', name: 'Казахстан', patterns: ['казахстан', 'алматы', 'медеу'] },
  { code: 'UZ', name: 'Узбекистан', patterns: ['узбекистан', 'самарканд'] },
  { code: 'TJ', name: 'Таджикистан', patterns: ['таджикистан', 'душанбе'] },
  { code: 'KG', name: 'Кыргызстан', patterns: ['кыргызстан', 'бишкек'] },
  { code: 'IN', name: 'Индия', patterns: ['индия', 'агра', 'тадж-махал'] },
  { code: 'TH', name: 'Таиланд', patterns: ['таиланд', 'тайланд', 'бангкок', 'пхукет'] },
  { code: 'VN', name: 'Вьетнам', patterns: ['вьетнам', 'ханой'] },
  { code: 'ID', name: 'Индонезия', patterns: ['индонез', 'бали', 'убуд', 'чангу'] },
  { code: 'MA', name: 'Марокко', patterns: ['марокко', 'марракеш'] },
  { code: 'NG', name: 'Нигерия', patterns: ['нигерия', 'лагос'] },
  { code: 'CL', name: 'Чили', patterns: ['чили', 'сантьяго'] },
  { code: 'PY', name: 'Парагвай', patterns: ['парагвай', 'асунсьон'] },
  { code: 'UY', name: 'Уругвай', patterns: ['уругвай', 'монтевидео'] },
  { code: 'BR', name: 'Бразилия', patterns: ['бразил', 'рио-де-жанейро'] },
  { code: 'AR', name: 'Аргентина', patterns: ['аргентин', 'буэнос-айрес'] },
  { code: 'US', name: 'США', patterns: ['сша', 'нью-йорк', 'таймс-сквер'] },
  { code: 'CA', name: 'Канада', patterns: ['канада', 'банф', 'луиз'] },
  { code: 'TZ', name: 'Танзания', patterns: ['танзан', 'килиманджаро', 'моши'] },
  { code: 'AU', name: 'Австралия', patterns: ['австрал', 'сидней'] },
  { code: 'CN', name: 'Китай', patterns: ['китай', 'пекин'] },
  { code: 'JP', name: 'Япония', patterns: ['япони', 'токио', 'киото', 'осака', 'саппоро'] },
  { code: 'KR', name: 'Южная Корея', patterns: ['сеул', 'корея'] },
  { code: 'AE', name: 'ОАЭ', patterns: ['дубай', 'оаэ'] },
  { code: 'SG', name: 'Сингапур', patterns: ['сингапур'] },
  { code: 'MX', name: 'Мексика', patterns: ['мехико'] },
  { code: 'ZA', name: 'ЮАР', patterns: ['кейптаун'] },
  { code: 'GR', name: 'Греция', patterns: ['афины'] },
];

export function detectCountryByPlaceTitle(title: string): CountryRule | undefined {
  const value = title.toLowerCase();
  return COUNTRY_RULES.find((rule) =>
    rule.patterns.some((pattern) => value.includes(pattern)),
  );
}
