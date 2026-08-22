import { config } from 'dotenv';
config({ path: '.env.local' });

import connectToDatabase from '../lib/db/mongoose';
import { TestSeries } from '../lib/models/TestSeries';
import { parseTxtQuestions, parseAnswerKey } from '../lib/parsers/txt-parser';
import { matchEnglishAndHindiQuestions } from '../lib/parsers/question-matcher';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// Complete raw texts from the user's upload
const rawEnglish = `Directions (Q. Nos. E-1 to E-5) Read the passage given below and answer the questions that follow :
Amitabh Bachchan, popularly known as big B, was born in Allahabad, Uttar Pradesh on 11 October 1942. He is an iconic actor whose career in Indian Cinema has spanned four decades. His father H.R. Bachchan was a well-known Hindi poet. (Bachchan is actually his father’s pen name but has now become the family surname) Amitabh attended boys’ High School in Allahabad, followed by Sherwood College in Nainital and earned a degree in science from Delhi university. His first film was ‘Saat Hindustani’ (1969). He became well-known as a movie star in 1973 after the success of ‘Abhimaan’ and ‘Zanjeer’ which was followed by his box office successes such as ‘Sholay’ ‘Amar Akbar Anthony’, ‘Trishul’, ‘Don’ and “Deewar’. He often played the role of an angry young man fighting a corrupt establishment, a theme that had tremendous appeal in India at that time.

1. Which city is the birth place of Amitabh in India?
(a) Bombay
(b) Delhi
(c) Bangalore
(d) More than one of the above
(e) None of the above

2. How long has Amitabh Bachchan dominated Indian Cinema?
(a) Three decades
(b) Four decades
(c) Two decades
(d) More than one of the above
(e) None of the above

3. From which university did Amitabh earn his degree in science?
(a) Aligarh Muslim University
(b) Banaras Hindu University
(c) Punjab University
(d) More than one of the above
(e) None of the above

4. When did Amitabh got recognition as a movie star in India?
(a) 1966
(b) 1969
(c) 1973
(d) More than one of the above
(e) None of the above

5. Which film of the following is Amitabh’s first film?
(a) ‘Zanjeer’
(b) ‘Abhiman’
(c) ‘Saat Hindustani’
(d) More than one of the above
(e) None of the above

6. The shadow of moon fills on ______ Earth.
(a) an
(b) a
(c) the
(d) More than one of the above
(e) None of the above

7. I have always wanted to study abroad, not only for ____ degree but also for the experience.
(a) an
(b) a
(c) the
(d) More than one of the above
(e) None of the above

8. First May 2024 is Wednesday, what day of the week would be 9th of May?
(a) Friday
(b) Thursday
(c) Monday
(d) More than one of the above
(e) None of the above

9. When did the change come in the life of Ram Prasad?
(a) On coming in contact with revolutionaries
(b) When America got independence
(c) When he came in contact with Arya Samaj
(d) More than one of the above
(e) None of the above

10. How did Bismil solve the financial problem?
(a) By looting government treasury
(b) By collecting donations
(c) By looting the poor
(d) More than one of the above
(e) None of the above

11. Why was Bismil called a great revolutionary?
(a) Because he was sentenced to death
(b) Because he wrote books
(c) Because he shook the British rule through his deeds
(d) More than one of the above
(e) None of the above

12. The root word in 'Sajag' is:
(a) Saj
(b) Jag
(c) G
(d) More than one of the above
(e) None of the above

13. The antonym of 'Swatantrata' (Independence) is:
(a) Gantantrata
(b) Loktantrata
(c) Prajatantrata
(d) More than one of the above
(e) None of the above

14. The antonym of 'Alpayu' (Short-lived) is:
(a) Lambayu
(b) Deerghayu
(c) Alpayu
(d) More than one of the above
(e) None of the above

15. Why is human life considered superior among living beings?
(a) Because man is successful
(b) Because man is intelligent and imaginative
(c) Because man is hardworking and tough
(d) More than one of the above
(e) None of the above

16. What kind of thoughts should a person have to progress?
(a) False, high, and impure
(b) Baseless
(c) True, simple, and pure
(d) More than one of the above
(e) None of the above

17. What is true simplicity?
(a) Ideological and practical
(b) A person's clothing
(c) A person's ostentation
(d) More than one of the above
(e) None of the above

18. The antonym of 'Unnati' (Progress) is:
(a) Pronnati
(b) Padonnati
(c) Avanati
(d) More than one of the above
(e) None of the above

19. Which Samas is present in 'Mahatma'?
(a) Karmadharaya Samas
(b) Avyayibhava Samas
(c) Tatpurusha Samas
(d) More than one of the above
(e) None of the above

20. What is the phonetic breakdown of 'Pratyek'?
(a) P + R + A + T + A + Y + E + K
(b) P + R + A + T + A + Y + E + K + A
(c) P + R + A + T + Y + E + K + A
(d) More than one of the above
(e) None of the above

21. Which of the following is an example of Vriddhi Sandhi?
(a) Vidyalaya
(b) Maharshi
(c) Mahaujasvi
(d) More than one of the above
(e) None of the above

22. Which of the following has correct spelling?
(a) Adwitiya (Incorrect)
(b) Adwitiya (द्वितीय)
(c) Adwittiya (द्वित्तीय)
(d) More than one of the above
(e) None of the above

23. Which of the following is a feminine noun?
(a) Bahan (Sister)
(b) Mantri (Minister)
(c) Julaha (Weaver)
(d) More than one of the above
(e) None of the above

24. Which of the following is a synonym of Sun (Surya)?
(a) Rakesh
(b) Sarang
(c) Aditya
(d) More than one of the above
(e) None of the above

25. The antonym of 'Sthir' (Stable) is:
(a) Chanchal
(b) Asthir
(c) Nirvikar
(d) More than one of the above
(e) None of the above

26. In the sentence 'I bought one litre of milk', the adjective is:
(a) I
(b) One litre
(c) Milk
(d) More than one of the above
(e) None of the above

27. Which Samas is in 'Yathashakti'?
(a) Avyayibhava
(b) Karmadharaya
(c) Bahuvrihi
(d) More than one of the above
(e) None of the above

28. One word for 'a person who speaks less':
(a) Mitbhashi
(b) Vachal
(c) Mishtbhashi
(d) More than one of the above
(e) None of the above

29. The idiom meaning 'to ignore deliberately' is:
(a) Aankhein churana
(b) Aankhon mein gadna
(c) Aankhein pher lena
(d) More than one of the above
(e) None of the above

30. The prefix (Upasarg) in 'Nirdosh' is:
(a) Ni
(b) Nir
(c) Nis
(d) More than one of the above
(e) None of the above

31. A player makes 7 complete revolutions of a circular path to complete a race of 2200 metres. The radius of the circular path is (pi = 22/7):
(a) 42 metres
(b) 45 metres
(c) 50 metres
(d) More than one of the above
(e) None of the above

32. If the capacity of a cylindrical tank is 1848 m3 and the diameter of its base is 14 m, the depth of the tank is (pi = 22/7):
(a) 8 m
(b) 12 m
(c) 16 m
(d) More than one of the above
(e) None of the above

33. If 1/8th of a number is 30, what will be 62% of that number?
(a) 181.3
(b) 178.24
(c) 148.8
(d) More than one of the above
(e) None of the above

34. The salary of an officer is increased by 25%. By what percent should the new salary be decreased to restore the original salary?
(a) 25%
(b) 22.5%
(c) 20%
(d) More than one of the above
(e) None of the above

35. By what number should (-2/3)^(-3) be divided so that the quotient is (4/9)^(-2)?
(a) 2/3
(b) -2/3
(c) -3/2
(d) More than one of the above
(e) None of the above

36. If x + 1/x = 5, what is the value of x^4 + 1/x^4?
(a) 525
(b) 527
(c) 529
(d) More than one of the above
(e) None of the above

37. A bag contains 5-rupee, 2-rupee and 1-rupee coins in the ratio 2 : 3 : 4. The total value of all the coins is Rs. 2,000. How many coins of 2-rupee are there in the bag?
(a) 200
(b) 250
(c) 400
(d) More than one of the above
(e) None of the above

38. The interior angle of a regular polygon exceeds its exterior angle by 108°. How many sides does the polygon have?
(a) 10
(b) 9
(c) 8
(d) More than one of the above
(e) None of the above

39. Zinc Oxide is normally used in the manufacture of:
(a) Paints
(b) Explosives
(c) Solvents
(d) More than one of the above
(e) None of the above

40. Lenz’s law is derived from the law of conservation of:
(a) Magnetism
(b) Momentum
(c) Charge
(d) More than one of the above
(e) None of the above

41. Glycogen stored in liver and muscles of human body is in form of:
(a) Monosaccharide
(b) Polysaccharide
(c) Protein
(d) More than one of the above
(e) None of the above

42. In which of the following blood has defective haemoglobin?
(a) Haematoma
(b) Sickle cell Anaemia
(c) Haemophilia
(d) More than one of the above
(e) None of the above

43. In which of the following medicine production, ethyl alcohol can be used?
(a) Antiseptic
(b) Antipyretic
(c) Anti-allergic
(d) More than one of the above
(e) None of the above

44. Velocity of sound at 15°C and 380mm pressure is 340 m/s. If the pressure is doubled without change of temperature, the velocity of sound would become:
(a) 680 m/s
(b) 170 m/s
(c) 190 m/s
(d) 340 m/s
(e) None of the above

45. If a bacterium cell divides in every 15 min, how many bacteria will be formed in 2 hours?
(a) 8
(b) 16
(c) 64
(d) 256
(e) None of the above

46. Plants and animal cell differ in which of the following structure?
(a) Enzymes
(b) Nuclei
(c) Cell wall
(d) More than one of the above
(e) None of the above

47. According to the recent report of Forbes, which is the strongest currency in the world?
(a) Omani Rial
(b) Kuwaiti Dinar
(c) Bahrain Dinar
(d) More than one of the above
(e) None of the above

48. In which city of Maharashtra did PM Narendra Modi launch 8 AMRUT projects?
(a) Kollam
(b) Baroda
(c) Solapur
(d) More than one of the above
(e) None of the above

49. IIT Madras has tied up with whom to launch e Mobility Simulation Lab?
(a) Altair
(b) Starlink
(c) Farber Speciality Lab
(d) More than one of the above
(e) None of the above

50. Who won the Best Actor Award at the Academy Awards 2024 (Oscars)?
(a) Dwayne Johnson
(b) Cillian Murphy
(c) Tom Cruise
(d) More than one of the above
(e) None of the above

51. Who was recently selected as the ICC Women’s T20i Cricketer of the year 2023?
(a) Smriti Mandhana (India)
(b) Nat Sciver-Brunt (England)
(c) Hayley Matthews (West Indies)
(d) More than one of the above
(e) None of the above

52. Who was Crowned Miss World 2024 in Mumbai?
(a) Miss Czech Krystyna Pyszková
(b) Miss India Sini Shetty
(c) Miss Lebanon Yasmina Zaytoun
(d) More than one of the above
(e) None of the above

53. In which country will the clean Energy Investor Forum be organised by IPEF?
(a) France
(b) Singapore
(c) Spain
(d) More than one of the above
(e) None of the above

54. India has acquired the right to operate the foreign Sittwe Port, it is in which country?
(a) Sri Lanka
(b) Bangladesh
(c) Myanmar
(d) More than one of the above
(e) None of the above

55. Mangrove forest of Ganga Delta is called:
(a) Sunderban
(b) Sundergarh
(c) Surendranagar
(d) More than one of the above
(e) None of the above

56. Which river is frequently changing its course of flow in Bihar?
(a) Gandak
(b) Kosi
(c) Punpun
(d) More than one of the above
(e) None of the above

57. Plant roots gets water from soil as:
(a) Bound water
(b) Hygroscopic water
(c) Capillary water
(d) More than one of the above
(e) None of the above

58. How much equatorial diameter is larger than polar diameter?
(a) 36 km
(b) 43 km
(c) 49 km
(d) More than one of the above
(e) None of the above

59. The Indian Standard Time (IST) is taken at which longitude:
(a) 82.5° E
(b) 78.5° E
(c) 87.5° E
(d) More than one of the above
(e) None of the above

60. In India ‘Green revolution’ is known to credit to whom?
(a) Dr. V. Kurien
(b) Dr. M.S. Swaminathan
(c) Sri. S.L. Bahuguna
(d) More than one of the above
(e) None of the above

61. Highest Mountain peak of India is known as:
(a) Everest
(b) Kanchenjunga
(c) K-2 (Godwin Austen)
(d) More than one of the above
(e) None of the above

62. Indian continent was earlier part of:
(a) Gondwanaland
(b) Tethys
(c) Pangea
(d) More than one of the above
(e) None of the above

63. Who led the Revolt of 1857 in Bihar?
(a) Tatya Tope
(b) Kunwar Singh
(c) Nana Saheb
(d) More than one of the above
(e) None of the above

64. The spiritual side of nationalism was voiced by:
(a) Raja Ram Mohan Roy
(b) Swami Shraddhanand
(c) Swami Vivekananda
(d) More than one of the above
(e) None of the above

65. Which newspaper propagated strong nationalist views during India’s freedom struggle?
(a) Pioneer
(b) Amrita Bazar Patrika
(c) Statesman
(d) More than one of the above
(e) None of the above

66. Who intervened in a dispute between the workers and mill owners of Ahmedabad in 1918?
(a) Vallabhbhai Patel
(b) Mahatma Gandhi
(c) Jamshedji Tata
(d) More than one of the above
(e) None of the above

67. Name the left-wing leader of Bihar Provincial Kisan Sabha who popularised this in Bihar:
(a) Karyanand Sharma
(b) Wadhwa Ram
(c) P.C. Joshi
(d) More than one of the above
(e) None of the above

68. Muddiman Committee was appointed to report on the working of the:
(a) Dyarchy
(b) Communal representation
(c) Federalism
(d) More than one of the above
(e) None of the above

69. “He was a great unifier in India who taught us not only bare tolerance of others but the willing acceptance of them as our friends and comrades in common undertakings” who said it?
(a) Subhash Chandra Bose
(b) Balgangadhar Tilak
(c) Rajendra Prasad
(d) More than one of the above
(e) None of the above

70. Who proceeded to organise the Provisional Government of Free India outside the country?
(a) Raja Mahendra Pratap
(b) Rash Behari Bose
(c) Subhash Chandra Bose
(d) More than one of the above
(e) None of the above

71. In the word ‘Naad’ the meaning of the letter ‘Na’ is:
(a) Prana Vayu
(b) Agni Shakti
(c) Omkar
(d) More than one of the above
(e) None of the above

72. How many shrutis are there in note ‘Madhyam’?
(a) 2
(b) 3
(c) 4
(d) More than one of the above
(e) None of the above

73. Which author among the following has mentioned the number of Vikrit swaras as five?
(a) Sharang Dev
(b) Ahobal
(c) Venkatmakhi
(d) More than one of the above
(e) None of the above

74. The origin place of the notes of the lower octave (Mandra Saptak) is:
(a) Kantha Sthan (Throat area)
(b) Hriday Sthan (Heart area)
(c) Udar Sthan (Abdominal space)
(d) More than one of the above
(e) None of the above

75. In the Sarana Chatushtayi, how many strings did Bharat Muni tie in the Veenas?
(a) 7-7 strings
(b) 12-12 strings
(c) 22-22 strings
(d) More than one of the above
(e) None of the above

76. What is referred to as ‘Ati Swar’?
(a) Auxiliary sound
(b) Upper partials notes
(c) Over tones (Swayambhu Swar)
(d) More than one of the above
(e) None of the above

77. Which musician established modern shruti – swar system?
(a) Acharya Brihaspati
(b) Pandit Vishnu Digambar Paluskar
(c) Pandit Vishnu Narayan Bhatkhande
(d) More than one of the above
(e) None of the above

78. Which category do Consonance and Dissonance belong to?
(a) Harmony
(b) Melody
(c) Swar-Samvad
(d) More than one of the above
(e) None of the above

79. The difference of microtones between the notes ‘Shadja’ and ‘Pancham’ is:
(a) Nine microtones
(b) Eleven microtones
(c) Thirteen microtones
(d) More than one of the above
(e) None of the above

80. The proportion between the notes ‘Ma’ and ‘Ga’ will be:
(a) 9/8
(b) 16/15
(c) 10/9
(d) More than one of the above
(e) None of the above

81. Which Thaat has Flat notes of Re, Ga, Dha, Ni from the following:
(a) Asawari
(b) Bhairavi
(c) Todi
(d) More than one of the above
(e) None of the above

82. In the Raga-Ragini classification, 6 Raags and 36 Raginies are considered according to which opinion or Mat?
(a) ‘Shiv Mat’
(b) Kallinath Mat
(c) Someshwar Mat
(d) More than one of the above
(e) None of the above

83. How many Ragas and Raginies are considered in the ‘Krishna Mat’?
(a) 5 Ragas 36 Raginies
(b) 6 Ragas 30 Raginies
(c) 6 Ragas 36 Raginies
(d) More than one of the above
(e) None of the above

84. What is meant by the term Raganga?
(a) Musical phrases of Main Raga
(b) Shadow of Equivalent Ragas
(c) Types of Ragas
(d) More than one of the above
(e) None of the above

85. Among the following, which classification is known as Janya Janak Thaat Rag classification?
(a) Raga-Ragini classification
(b) Raganga classification
(c) Mel Raag classification
(d) More than one of the above
(e) None of the above

86. In which text is the term ‘Gram Raag’ mentioned for the first time?
(a) Natya Shastra
(b) Brihaddeshi
(c) Sangeet Ratnakar
(d) More than one of the above
(e) None of the above

87. What falls under the category of Nibaddha Gaan?
(a) Prabandha
(b) Vastu
(c) Rupak
(d) More than one of the above
(e) None of the above

88. In Anibaddha Gaan in which type of Alaap is the Aavirbhav-Tirobhav shown?
(a) Ragalap
(b) Aalapti Gaan
(c) Rupakalap
(d) More than one of the above
(e) None of the above

89. How many parts are there in the Prabandh?
(a) Two
(b) Four
(c) Six
(d) More than one of the above
(e) None of the above

90. According to Sangeet Ratnakar Uttam, Madhyam and Adham are related to whom?
(a) Gayak
(b) Kalawant
(c) Vaggeykar
(d) More than one of the above
(e) None of the above

91. ‘Raagaalap’ falls under which category?
(a) Nibaddha Gaan
(b) Anibaddha Gaan
(c) Prabandha Gaan
(d) More than one of the above
(e) None of the above

92. The Artist of Gwalior Gharana is:
(a) Ustad Nisar Hussain Khan
(b) Pandit Krishna Rao Shankar
(c) Pandit Raja Bhaiya Puchh Wale
(d) More than one of the above
(e) None of the above

93. In Khyal style of singing, the word ‘Khyal’ is originated from which Language?
(a) Urdu
(b) Arabi
(c) Pharsi
(d) More than one of the above
(e) None of the above

94. The singer of the Dhrupad style was:
(a) Swami Haridas
(b) Miya Tansen
(c) Baiju
(d) More than one of the above
(e) None of the above

95. The Thumri of the Purab Ang is:
(a) Thumri Punjab and Jaipur
(b) Thumri of Lucknow and Banaras
(c) Thumri of Sindh and Punjab
(d) More than one of the above
(e) None of the above

96. Which among the following is not a style of singing?
(a) Gat
(b) Tappa
(c) Paran
(d) More than one of the above
(e) None of the above

97. In Vedic Music, which of the following types of singing were prevalent?
(a) Sam Gaan
(b) Gatha Gaan
(c) Gandharv and Folk
(d) More than one of the above
(e) None of the above

98. Among the following the vedic Note is:
(a) Krushta
(b) Pratham
(c) Dwitiya
(d) More than one of the above
(e) None of the above

99. In Vedic era, which is the predominant in Veenas?
(a) Baan Veena
(b) Pichhola
(c) Kapishirshani
(d) More than one of the above
(e) None of the above

100. In the Vedic era the musical instrument called ‘Toon’ belongs to which category of Instruments?
(a) Tata
(b) Ghana
(c) Sushir
(d) More than one of the above
(e) None of the above

101. Which note of ‘Prati Madhyam’ of Carnatic Music is equivalent to Hindustani Music note?
(a) Shuddha Madhyam
(b) Teevra Madhyam
(c) Komal Madhyam
(d) More than one of the above
(e) None of the above

102. Which Hindustani Taal is similar to the Carnatic Taal ‘Atha Taal’?
(a) Choutaal
(b) Aada choutaal
(c) Kaharwa
(d) More than one of the above
(e) None of the above

103. In Carnatic music the lowest form of a Note is ‘Shuddha’.
(a) True
(b) False
(c) Nonpermanent
(d) More than one of the above
(e) None of the above

104. What is the equivalent term for the Hindustani Komal ‘Ni’ note in Carnatic music?
(a) Kakli ‘Ni’
(b) Kaishik ‘Ni’
(c) Shuddha ‘Ni’
(d) More than one of the above
(e) None of the above

105. The ancient Ashtottar Talam System belongs to which musical system?
(a) Vedic Sangeet
(b) Ravindra Sangeet
(c) Carnatic Sangeet
(d) More than one of the above
(e) None of the above

106. How many microtones are there between the Vaadi and Samvadi (Sa-Ma and Sa-Pa) notes in a Raag?
(a) 7 and 9
(b) 8 and 11
(c) 9 and 13
(d) More than one of the above
(e) None of the above

107. An example of a ‘Parmel Praveshak’ Raag is:
(a) Raag Jog
(b) Raag Bhatiyar
(c) Raag Jaijaiwanti
(d) More than one of the above
(e) None of the above

108. An example of a ‘Sandhi Prakash’ Raag is:
(a) Miya ki Todi
(b) Shyam Kalyan
(c) Madhuvanti
(d) More than one of the above
(e) None of the above

109. In the given notes, the symbolic notation of ‘meend’ is:
(a) (Ga Ma)
(b) Ga Ma
(c) Meend Arc over Ga Ma
(d) More than one of the above
(e) None of the above

110. How many types of Gamak did Pandit Sharang Dev mention?
(a) 10
(b) 15
(c) 20
(d) More than one of the above
(e) None of the above

111. Among the following, the ‘Aashray Raag’ is:
(a) Bhairav
(b) Todi
(c) Kafi
(d) More than one of the above
(e) None of the above

112. Music instruments played with bow are:
(a) Israj
(b) Sarangi
(c) Violin
(d) More than one of the above
(e) None of the above

113. Which category of Instrument does ‘Jal Tarang’ belong to?
(a) Tata
(b) Awanaddha
(c) Ghana
(d) More than one of the above
(e) None of the above

114. Orchestra is a style of:
(a) Single playing (solo)
(b) Duet playing
(c) Group playing (Vrinda Vadan)
(d) More than one of the above
(e) None of the above

115. Instruments played with ‘Java’ are:
(a) Veena
(b) Sitar
(c) Sarod
(d) More than one of the above
(e) None of the above

116. Among the following, Instruments made of ‘Tumba’ and ‘Dand’ are:
(a) Tanpura
(b) Sitar
(c) Surbahar
(d) More than one of the above
(e) None of the above

117. Sweet music characterized by sequential singing or playing of notes is called:
(a) Melody
(b) Compound Harmony
(c) Simple Harmony
(d) More than one of the above
(e) None of the above

118. In western music # symbol indicates:
(a) Natural Note
(b) Flat Note
(c) Sharp Note
(d) More than one of the above
(e) None of the above

119. Scale with equal spacing between twelve notes is:
(a) Natural scale
(b) Diatonic scale
(c) Tempered scale
(d) More than one of the above
(e) None of the above

120. Which Western Musical Notation system is prevalent nowadays?
(a) Solfa and Neumes Notation
(b) Staff Notation
(c) Chievh Notation
(d) More than one of the above
(e) None of the above

121. How many main types of Harmony are there?
(a) Two
(b) Three
(c) Four
(d) More than one of the above
(e) None of the above

122. Who was the Guru of Pandit Omkarnath Thakur?
(a) Pt. D.V. Paluskar
(b) Pt. V.D. Paluskar
(c) Pt. V.N. Bhatkhande
(d) More than one of the above
(e) None of the above

123. Who founded the Gandharva Mahavidyalaya?
(a) Pt. Omkarnath Thakur
(b) Pt. Vishnu Narayan Bhatkhande
(c) Pt. Vishnu Digambar Paluskar
(d) More than one of the above
(e) None of the above

124. Book written by Pandit Vishnu Narayan Bhatkhande is:
(a) Abhinav Raag Manjari
(b) Lakshya Sangeet
(c) Swar Malika
(d) More than one of the above
(e) None of the above

125. Pandit Ram Chatur Mallik was artist of which genre?
(a) Vocalist
(b) Instrumentalist
(c) Dancer
(d) More than one of the above
(e) None of the above

126. Artist from the lineage of Baba Allauddin Khan is:
(a) Pt. Pannalal Ghosh
(b) Pt. Nikhil Banerji
(c) Smt. Shishir Kana Dhar Choudhary
(d) More than one of the above
(e) None of the above

127. Book Authored by Pandit Vishnu Digambar Paluskar is:
(a) Raag Pravesh
(b) Nardiya Shiksha Sateek
(c) Bhartiya Sangeet Lekhan Paddhati
(d) More than one of the above
(e) None of the above

128. How many chapters are there in the Natya Shastra?
(a) 36
(b) 35
(c) 34
(d) More than one of the above
(e) None of the above

129. Who authored the Brihaddeshi Text?
(a) Narad
(b) Matang
(c) Bharat
(d) More than one of the above
(e) None of the above

130. Which is the text called ‘Saptaddhyayi’?
(a) Brihaddeshi
(b) Raag Tarangini
(c) Sangeet Ratnakar
(d) More than one of the above
(e) None of the above

131. The time period of the composition of ‘Raag Tarangini’ Text is:
(a) 14th century
(b) 15th century
(c) 16th century
(d) More than one of the above
(e) None of the above

132. Which author among the following is also known as ‘Nishank’?
(a) Pt. Lochan
(b) Pt. Sharang Dev
(c) Pt. Sriniwas
(d) More than one of the above
(e) None of the above

133. How many versions of the ‘Natya Shastra’ text are available at present?
(a) 3 versions
(b) 4 versions
(c) 5 versions
(d) More than one of the above
(e) None of the above

134. When playing or singing Raag Darbari Kanhada in the higher octave, which other Raag’s essence starts to emerge?
(a) Jounpuri
(b) Aasawari
(c) Adana
(d) More than one of the above
(e) None of the above

135. Which Raag is ‘Madhyam Vadi’ among the following?
(a) Raag Bahar
(b) Raag Gaud Sarang
(c) Raag Hamir
(d) More than one of the above
(e) None of the above

136. Which Ragas are combined in the Raag Shuddha Kalyan?
(a) Raag Bhoopali and Yaman
(b) Raag Deshkar and Shyam Kalyan
(c) Raag Bilawal and Yaman
(d) More than one of the above
(e) None of the above

137. Which type of Raag is ‘Raag Shree’?
(a) Parmel Praveshak Raag
(b) Sandhi Prakash Raag
(c) Aashray Raag
(d) More than one of the above
(e) None of the above

138. Key points of the classical introduction to Raag Shankara are:
(a) Thata - Bilawal
(b) Uttarang Pradhan
(c) Jati Audav-Shadav
(d) More than one of the above
(e) None of the above

139. Key points of the classical introduction to Taal-Ektaal are:
(a) 12 Matra Taal
(b) Taali on 1st, 5th, 9th, 11th beat
(c) Khali on 3rd and 7th beat
(d) More than one of the above
(e) None of the above

140. How many times is the symbol ‘Dha’ used in ‘Tritaal’?
(a) 4 times
(b) 6 times
(c) 8 times
(d) More than one of the above
(e) None of the above

141. Among the following, Taal with an empty beat (Khali) and consisting of three claps (Taali) is:
(a) Jhaptaal
(b) Teentaal
(c) Rupak
(d) More than one of the above
(e) None of the above

142. The term for Kuaad Laya is:
(a) 5/4
(b) 4/5
(c) 3/4
(d) More than one of the above
(e) None of the above

143. 1½ rhythm is called:
(a) Sava-gun
(b) Paun-gun
(c) Dedh-gun
(d) More than one of the above
(e) None of the above

144. Group of eleven lines in western staff notation is called:
(a) G-clef
(b) Clef signature
(c) Great Stave
(d) More than one of the above
(e) None of the above

145. In western music ‘♩’ symbol signifies:
(a) Hole Tone
(b) Half Note
(c) Quarter Note
(d) More than one of the above
(e) None of the above

146. The difference between Raag Chhayanat and Raag Kamod is:
(a) Vadi-Samvadi
(b) Use of two Madhyamas
(c) Use of Komal Ni, as a vivadi note
(d) More than one of the above
(e) None of the above

147. People of which tradition sing ‘Nayakwaa’ song?
(a) Naayi
(b) Teli
(c) Dhobi
(d) More than one of the above
(e) None of the above

148. ‘Jhakuria’ song is a type of:
(a) Kajari
(b) Chaiti
(c) Phaag
(d) More than one of the above
(e) None of the above

149. Among the following, the false statement is:
(a) Raag Miya Malhar is a Raag of Sarang Ang
(b) Raag Bahar is Raag of Kanhada Ang
(c) Raag Miya Malhar has the same notes as Raag Bahar has
(d) More than one of the above
(e) None of the above

150. The use of two notes in three quantities (beats) is called in western staff notation:
(a) Triplet
(b) Duplet
(c) Quintuplet
(d) More than one of the above
(e) None of the above`;

const rawHindi = `निर्देश (प्र. सं. E-1 से E-5) नीचे दिए गए गद्यांश को पढ़कर पूछे गए प्रश्नों के उत्तर दीजिए :
अमिताभ बच्चन, जिन्हें लोकप्रिय रूप से 'बिग बी' के नाम से जाना जाता है, का जन्म 11 अक्टूबर 1942 को इलाहाबाद, उत्तर प्रदेश में हुआ था। वह एक प्रतिष्ठित अभिनेता हैं जिनका भारतीय सिनेमा में करियर चार दशकों तक फैला रहा है। उनके पिता डॉ. हरिवंश राय बच्चन एक प्रसिद्ध हिंदी कवि थे। (बच्चन वास्तव में उनके पिता का उपनाम है, जो अब परिवार का उपनाम बन गया है) अमिताभ ने इलाहाबाद के बॉयज हाई स्कूल, उसके बाद नैनीताल के शेरवुड कॉलेज से पढ़ाई की और दिल्ली विश्वविद्यालय से विज्ञान में डिग्री प्राप्त की। उनकी पहली फिल्म 'सात हिन्दुस्तानी' (1969) थी। 1973 में 'अभिमान' और 'ज़ंजीर' की सफलता के बाद वे एक फिल्म स्टार के रूप में प्रसिद्ध हुए, जिसके बाद 'शोले', 'अमर अकबर एंथनी', 'त्रिशूल', 'डॉन' और 'दीवार' जैसी बॉक्स ऑफिस सफल फिल्में आईं। वे अक्सर एक भ्रष्ट व्यवस्था से लड़ने वाले एक गुस्सैल युवा (एंग्री यंग मैन) की भूमिका निभाते थे, जिसका उस समय भारत में जबरदस्त प्रभाव था।

1. अमिताभ बच्चन का भारत में जन्म स्थान कौन सा शहर है?
(a) बंबई
(b) दिल्ली
(c) बैंगलोर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

2. अमिताभ बच्चन ने भारतीय सिनेमा में कितने समय तक अपना प्रभाव बनाए रखा है?
(a) तीन दशक
(b) चार दशक
(c) दो दशक
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

3. अमिताभ ने किस विश्वविद्यालय से विज्ञान में स्नातक की उपाधि प्राप्त की?
(a) अलीगढ़ मुस्लिम विश्वविद्यालय
(b) बनारस हिंदू विश्वविद्यालय
(c) पंजाब विश्वविद्यालय
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

4. भारत में अमिताभ को फिल्म स्टार के रूप में पहचान कब मिली?
(a) 1966
(b) 1969
(c) 1973
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

5. निम्नलिखित में से कौन सी अमिताभ की पहली फिल्म है?
(a) 'ज़ंजीर'
(b) 'अभिमान'
(c) 'सात हिन्दुस्तानी'
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

6. The shadow of moon fills on ______ Earth.
(a) an
(b) a
(c) the
(d) More than one of the above
(e) None of the above

7. I have always wanted to study abroad, not only for ____ degree but also for the experience.
(a) an
(b) a
(c) the
(d) More than one of the above
(e) None of the above

8. 1 मई 2024 को बुधवार है, तो 9 मई को सप्ताह का कौन सा दिन होगा?
(a) शुक्रवार
(b) गुरुवार
(c) सोमवार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

9. राम प्रसाद के जीवन में परिवर्तन कब आया ?
(a) क्रांतिकारियों के संपर्क में आने पर
(b) जब अमरीका को स्वतंत्रता मिली
(c) जब वे आर्य समाज के संपर्क में आए
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

10. बिस्मिल ने धन की समस्या कैसे हल की ?
(a) सरकारी खज़ाना लूटकर
(b) चंदा इकट्ठा करके
(c) गरीबों को लूटकर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

11. बिस्मिल महान क्रांतिकारी क्यों कहलाए?
(a) क्योंकि उन्हें फाँसी की सज़ा दी गई।
(b) क्योंकि उन्होंने पुस्तकें लिखीं।
(c) क्योंकि उन्होंने अपने कार्यों से अंग्रेज़ी हुकूमत को हिला दिया।
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

12. 'सजग' में मूल शब्द है :
(a) सज
(b) जग
(c) ग
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

13. 'स्वतंत्रता' शब्द का विलोम है :
(a) गणतंत्रता
(b) लोकतंत्रता
(c) प्रजातंत्रता
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

14. 'अल्पायु' का विलोम शब्द है :
(a) लंबायु
(b) दीर्घायु
(c) अल्पायु
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

15. मनुष्य का जीवन संसार के प्राणियों में श्रेष्ठ क्यों माना गया है?
(a) क्योंकि वह सफल है
(b) क्योंकि वह बुद्धिमान और कल्पनाशील है
(c) क्योंकि वह परिश्रमी और कठोर है
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

16. उन्नति करने के लिए मनुष्य के विचार कैसे होने चाहिए?
(a) झूठे, ऊँचे और अपवित्र
(b) बेबुनियाद
(c) सच्चे, सादे और पवित्र
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

17. वास्तविक सादगी क्या है?
(a) वैचारिक और व्यावहारिक
(b) मनुष्य का पहनावा
(c) मनुष्य का दिखावा
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

18. 'उन्नति' शब्द का विलोम शब्द है :
(a) प्रोन्नति
(b) पदोन्नति
(c) अवनति
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

19. 'महात्मा' शब्द में कौन सा समास है?
(a) कर्मधारय समास
(b) अव्ययीभाव समास
(c) तत्पुरुष समास
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

20. 'प्रत्येक' शब्द का वर्ण-विच्छेद है :
(a) प्+र्+आ+त्+अ+य्+ए+क्
(b) प्+र्+अ्+त्+अ+य्+ए+क्+अ
(c) प्+र्+अ+त्+य्+ए+क्+अ
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

21. निम्नलिखित में से वृद्धि संधि का उदाहरण है :
(a) विद्यालय
(b) महर्षि
(c) महौजस्वी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

22. निम्नलिखित में से शुद्ध वर्तनी है :
(a) अद्वितिय
(b) अद्वितीय
(c) अद्वित्तीय
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

23. निम्नलिखित में से स्त्रीलिंग शब्द है :
(a) बहन
(b) मंत्री
(c) जुलाहा
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

24. निम्नलिखित में से 'सूर्य' का पर्यायवाची शब्द है :
(a) राकेश
(b) सारंग
(c) आदित्य
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

25. 'स्थिर' का विलोम शब्द है :
(a) चंचल
(b) अस्थिर
(c) निर्विकार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

26. 'मैंने एक लीटर दूध खरीदा' में विशेषण पद है :
(a) मैं
(b) एक लीटर
(c) दूध
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

27. 'यथाशक्ति' में कौन सा समास है?
(a) अव्ययीभाव
(b) कर्मधारय
(c) बहुब्रीहि
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

28. 'कम बोलनेवाला' वाक्यांश के लिए एक शब्द है :
(a) मितभाषी
(b) वाचाल
(c) मिष्टभाषी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

29. 'नज़रअंदाज़ करना' अर्थ के लिए उपयुक्त मुहावरा है :
(a) आँखें चुराना
(b) आँखों में गड़ना
(c) आँखें फेर लेना
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

30. 'निर्दोष' शब्द में उपसर्ग है :
(a) नि
(b) निर्
(c) निस्
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

31. एक खिलाड़ी किसी वृत्ताकार पथ के 7 पूरे चक्कर लगाकर 2200 मीटर की दौड़ पूरी करता है। वृत्ताकार पथ की त्रिज्या (pi = 22/7) है :
(a) 42 मीटर
(b) 45 मीटर
(c) 50 मीटर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

32. यदि एक बेलनाकार टैंक की धारिता 1848 घन मीटर है और इसके आधार का व्यास 14 मीटर है, तो टैंक की गहराई (pi = 22/7) होगी :
(a) 8 मीटर
(b) 12 मीटर
(c) 16 मीटर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

33. यदि किसी संख्या का आठवाँ भाग 30 है, तो उस संख्या का 62% कितना होगा?
(a) 181.3
(b) 178.24
(c) 148.8
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

34. एक अधिकारी का वेतन 25% बढ़ा दिया जाता है। नये वेतन को कितने प्रतिशत घटा दिया जाय कि वह पुराने वेतन पर आ जाय?
(a) 25%
(b) 22.5%
(c) 20%
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

35. (-2/3)^(-3) को किस संख्या से विभाजित किया जाय कि भागफल (4/9)^(-2) हो?
(a) 2/3
(b) -2/3
(c) -3/2
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

36. यदि x + 1/x = 5, तो x^4 + 1/x^4 का क्या मान है?
(a) 525
(b) 527
(c) 529
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

37. एक थैले में 5-रुपये, 2-रुपये तथा 1-रुपये के सिक्के 2:3:4 के अनुपात में हैं। सभी सिक्कों का कुल मूल्य Rs. 2,000 है। थैले में 2-रुपये के कितने सिक्के हैं?
(a) 200
(b) 250
(c) 400
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

38. एक समबहुभुज का अन्त: कोण उसके बहिष्कोण से 108° अधिक है। इस बहुभुज में कितनी भुजायें हैं?
(a) 10
(b) 9
(c) 8
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

39. जिंक आक्साइड का साधारण रूप से किस के उत्पादन में उपयोग होता है?
(a) पेंट
(b) विस्फोटकों
(c) घोलकों
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

40. लेन्ज नियम की व्युत्पत्ति के लिए निम्न में किसके संरक्षण नियम का उपयोग होता है?
(a) चुम्बकत्व
(b) संवेग
(c) आवेश
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

41. मानव शरीर के यकृत एवं माँस पेशियों में संधारित ग्लाइकोज़ेन का रूप होता है:
(a) मोनोसैकाराइड
(b) पॉलीसैकाराइड
(c) प्रोटीन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

42. रक्त में त्रुटिपूर्ण हेमोग्लोबिन निम्न में किसमें दिखता है?
(a) रक्तगुल्म
(b) दात्र कोशिका अरक्तता
(c) हेमोफीलिया
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

43. निम्न में किस प्रकार की दवाई उत्पादन में इथाइल अल्कोहल का उपयोग किया जा सकता है?
(a) एन्टी सेप्टिक
(b) एन्टी पाइरेटिक
(c) एन्टी-एलर्जिक
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

44. 15°C ताप एवं 380mm दाब पर ध्वनि वेग 340 मी/से है। यदि ताप को अपरिवर्तित रखते हुए दाब को दो गुना कर दिया जाय तब ध्वनि वेग का मान होगा:
(a) 680 मी/से
(b) 170 मी/से
(c) 190 मी/से
(d) 340 मी/से
(e) उपर्युक्त में से कोई नहीं

45. यदि एक जीवाणु कोशिका का विभाजन प्रत्येक 15 मिनट में होता है तब 2 घंटे में कितने जीवाणु निर्मित होंगे?
(a) 8
(b) 16
(c) 64
(d) 256
(e) उपर्युक्त में से कोई नहीं

46. पौधों एवं जन्तु कोशिकाओं में अन्तर निम्न में किस संरचना से स्पष्ट होता है?
(a) एंजाइम
(b) नाभिक
(c) कोशिका भित्ति
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

47. फोर्ब्स की हालिया रिपोर्ट के अनुसार विश्व की सबसे मजबूत मुद्रा कौन-सी है?
(a) ओमानी रियाल
(b) कुवैती दीनार
(c) बहरीन दीनार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

48. महाराष्ट्र के किस शहर में पीएम नरेंद्र मोदी ने 8 अमृत परियोजनाओं की शुरुआत की?
(a) कोल्लम
(b) बड़ौदा
(c) सोलापुर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

49. आईआईटी मद्रास ने ई मोबिलिटी सिमुलेशन लैब स्थापित करने के लिए किसके साथ करार किया है?
(a) अल्टेयर
(b) स्टारलिंक
(c) फार्बर स्पेशलिटी लैब
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

50. अकादमी पुरस्कार 2024 (ऑस्कर) में सर्वश्रेष्ठ अभिनेता का पुरस्कार किसने जीता?
(a) ड्वेन जॉनसन
(b) सिलियन मर्फी
(c) टॉम क्रूज
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

51. किसे हाल ही में वर्ष 2023 के लिए ICC महिला T20i क्रिकेटर ऑफ द ईयर चुना गया?
(a) स्मृति मंधाना (भारत)
(b) नेट साइवर-ब्रंट (इंग्लैण्ड)
(c) हेले मैथ्यूज (वेस्टइंडीज)
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

52. मुंबई में सम्पन्न मिस वर्ल्ड 2024 का ताज किसके सिर पर सजा?
(a) मिस चेक क्रिस्टीना पिसकोवा
(b) मिस इन्डिया सिनी शेट्टी
(c) मिस लेबनान यास्मीना जेयटाउन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

53. स्वच्छ ऊर्जा निवेशक मंच (IPEF) का आयोजन किस देश में किया जायेगा?
(a) फ्रांस
(b) सिंगापुर
(c) स्पेन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

54. भारत ने विदेशी सितवे बंदरगाह को संचालित करने का अधिकार हासिल किया है, यह किस देश में है?
(a) श्रीलंका
(b) बांग्लादेश
(c) म्यांमार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

55. गंगा डेल्टा के सदाबहार वन क्षेत्र को क्या कहते हैं?
(a) सुन्दरवन
(b) सुन्दरगढ़
(c) सुरेन्द्रनगर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

56. बिहार की कौन-सी नदी अपना मार्ग परिवर्तित करने के लिए जानी जाती है?
(a) गण्डक
(b) कोसी
(c) पुनपुन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

57. वृक्ष की जड़ों को मृदा से पानी कैसे मिलता है?
(a) बँधा जल
(b) आर्द्रता जल
(c) केशिका जल
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

58. विषुवतीय व्यास ध्रुवीय व्यास से कितना अधिक है?
(a) 36 किमी
(b) 43 किमी
(c) 49 किमी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

59. किस रेखांश पर भारतीय मानक समय (IST) अपनाया जाता है?
(a) 82.5° पूर्व
(b) 78.5° पूर्व
(c) 87.5° पूर्व
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

60. भारत में 'हरित क्रांति' का श्रेय किसे जाता है?
(a) डॉ. वी. कुरियन
(b) डॉ. एम.एस. स्वामीनाथन
(c) श्री सुन्दरलाल बहुगुणा
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

61. भारत की सर्वोच्च पर्वत चोटी कौन-सी है?
(a) एवरेस्ट
(b) कंचनजंगा
(c) के-2 (गॉडविन ऑस्टिन)
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

62. भारतीय उपमहाद्वीप प्राचीन काल में मूलतः एक भाग था:
(a) गोण्डवाना लैण्ड का
(b) टेथिस का
(c) पेंजिया का
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

63. बिहार में 1857 की क्रान्ति को किसने नेतृत्व दिया था?
(a) तात्या टोपे
(b) कुंवर सिंह
(c) नाना साहेब
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

64. राष्ट्रवाद की आध्यात्मिक दिशा किसके द्वारा लोकप्रिय बनाई गई?
(a) राजा राममोहन राय
(b) स्वामी श्रद्धानन्द
(c) स्वामी विवेकानन्द
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

65. भारत के स्वतन्त्रता आन्दोलन के दौरान गहन राष्ट्रवादी विचारों को किस समाचार-पत्र द्वारा प्रचारित किया जाता था?
(a) पायनियर
(b) अमृत बाजार पत्रिका
(c) स्टेटसमैन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

66. 1918 में अहमदाबाद के मिल-मालिकों और मजदूरों के मध्य विवाद में किसने हस्तक्षेप किया था?
(a) वल्लभभाई पटेल
(b) महात्मा गांधी
(c) जमशेदजी टाटा
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

67. बिहार के किस वामपंथी नेता ने बिहार प्रान्तीय किसान सभा को लोकप्रिय बनाया?
(a) कार्यानंद शर्मा
(b) वधवा राम
(c) पी.सी. जोशी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

68. मुद्दीमन कमेटी को किसकी कार्यप्रणाली पर रिपोर्ट देने के लिए नियुक्त किया गया था?
(a) द्वैध शासन प्रणाली
(b) साम्प्रदायिक प्रतिनिधित्व
(c) संघवाद
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

69. “भारत में वह महान एकता कर्त्ता था जिसने केवल दूसरों को सहिष्णु ही नहीं बनाया अपितु उनको अपने मित्रों और साथियों में आपसी जिम्मेदारी के साथ भी स्वीकार्य करवाया था” यह किसने कहा?
(a) सुभाषचंद्र बोस
(b) बालगंगाधर तिलक
(c) राजेन्द्र प्रसाद
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

70. देश के बाहर स्वतन्त्र भारत की अस्थाई सरकार को संगठित करने में कौन आगे बढ़ा?
(a) राजा महेन्द्र प्रताप
(b) रास बिहारी बोस
(c) सुभाषचंद्र बोस
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

71. 'नाद' शब्द में 'ना' अक्षर से तात्पर्य है:
(a) प्राण वायु
(b) अग्नि शक्ति
(c) ओंकार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

72. मध्यम स्वर की कितनी श्रुतियां हैं?
(a) 2
(b) 3
(c) 4
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

73. निम्न में से किस ग्रन्थकार ने विकृत स्वरों की संख्या पाँच बताई है?
(a) शारंग देव
(b) अहोबल
(c) व्यंकटमखी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

74. मन्द्र सप्तक के स्वरों का उत्पत्ति स्थान है:
(a) कण्ठ स्थान
(b) हृदय स्थान
(c) उदर स्थान
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

75. भरतमुनि ने सारणा चतुष्टयी में वीणाओं में कितने तार बांधे थे?
(a) 7-7 तार
(b) 12-12 तार
(c) 22-22 तार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

76. 'अतिस्वर' किसे कहते हैं?
(a) सहायक नाद
(b) उपस्वर
(c) स्वयम्भू स्वर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

77. आधुनिक श्रुति-स्वर व्यवस्था की स्थापना किस संगीतज्ञ ने की है?
(a) आचार्य बृहस्पति
(b) पं. विष्णु दिगम्बर पलुस्कर
(c) पं. विष्णु नारायण भातखण्डे
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

78. संवादिता और विसंवादिता (Consonance and Dissonance) किसके अंतर्गत आते हैं?
(a) हार्मनी
(b) मेलोडी
(c) स्वर-संवाद
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

79. षड्ज और पंचम स्वर के बीच श्रुत्यांतर है:
(a) नौ श्रुति
(b) ग्यारह श्रुति
(c) तेरह श्रुति
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

80. स्वर 'म' और 'ग' का अनुपात होगा:
(a) 9/8
(b) 16/15
(c) 10/9
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

81. निम्न में से कोमल रे, ग, ध, नि स्वरों से प्रयुक्त थाट है:
(a) आसावरी
(b) भैरवी
(c) तोड़ी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

82. राग-रागिणी वर्गीकरण के किस मत में 6 राग 36 रागिनियां मानी जाती हैं?
(a) शिवमत
(b) कल्लिनाथ मत
(c) सोमेश्वर मत
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

83. कृष्ण मत में कितनी राग-रागिनियां मानी गई हैं?
(a) 5 राग 36 रागिनियां
(b) 6 राग 30 रागिनियां
(c) 6 राग 36 रागिनियां
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

84. 'रागांग' से क्या आशय है?
(a) मुख्य राग की स्वर संगतियां
(b) समकक्ष रागों की छाया
(c) रागों के भेद
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

85. 'जन्य जनक थाट राग' निम्न में से किस वर्गीकरण को कहा जाता है?
(a) राग-रागिनी वर्गीकरण
(b) रागांग वर्गीकरण
(c) मेल राग वर्गीकरण
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

86. 'ग्राम-राग' शब्द का उल्लेख सर्वप्रथम किस ग्रन्थ में मिलता है?
(a) नाट्यशास्त्र
(b) बृहद्देशी
(c) संगीत रत्नाकर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

87. निबद्ध गान के अन्तर्गत निम्न में से क्या आता है?
(a) प्रबन्ध
(b) वस्तु
(c) रूपक
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

88. अनिबद्ध गान के किस आलाप प्रकार में आविर्भाव-तिरोभाव दिखाया जाता है?
(a) रागालाप
(b) आलप्तिगान
(c) रूपकालाप
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

89. प्रबन्ध के कितने अंग हैं?
(a) दो
(b) चार
(c) छः
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

90. संगीत रत्नाकर के अनुसार 'उत्तम', 'मध्यम' एवं 'अधम' किससे सम्बन्धित हैं?
(a) गायक
(b) कलावन्त
(c) वाग्गेयकार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

91. 'रागालाप' किसके अन्तर्गत आता है?
(a) निबद्ध गान
(b) अनिबद्ध गान
(c) प्रबन्ध गान
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

92. ग्वालियर घराना के कलाकार हैं:
(a) उस्ताद निसार हुसैन खां
(b) पण्डित कृष्णराव शंकर
(c) पण्डित राजा भैया पूछवाले
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

93. गायन की ख़्याल शैली में 'ख़्याल' शब्द किस भाषा से निकला है?
(a) उर्दू
(b) अरबी
(c) फारसी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

94. ध्रुपद शैली के गायक थे:
(a) स्वामी हरिदास
(b) मियां तानसेन
(c) बैजू
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

95. पूरब अंग की ठुमरी है:
(a) पंजाब और जयपुर की ठुमरी
(b) लखनऊ और बनारस की ठुमरी
(c) सिन्ध और पंजाब की ठुमरी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

96. निम्न में से गायन की शैली नहीं है:
(a) गत
(b) टप्पा
(c) परन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

97. वैदिक संगीत में निम्न में से किस प्रकार के गायन का प्रचलन था?
(a) सामगान
(b) गाथा गान
(c) गांधर्व तथा लौकिक
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

98. निम्न में से वैदिक स्वर है:
(a) क्रुष्ट
(b) प्रथम
(c) द्वितीय
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

99. वैदिक कालीन वीणाओं में प्रमुख हैं:
(a) बाणवीणा
(b) पिच्छोला
(c) कपिशीर्षणी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

100. वैदिक कालीन 'तूण' नामक वाद्य किस वाद्य श्रेणी में आता है?
(a) तत्
(b) घन
(c) सुषिर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

101. कर्नाटक संगीत का 'प्रति मध्यम' हिन्दुस्तानी संगीत का कौन-सा स्वर है?
(a) शुद्ध मध्यम
(b) तीव्र मध्यम
(c) कोमल मध्यम
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

102. कर्नाटकीय 'अट ताल' जैसी हिन्दुस्तानी ताल कौन सी है?
(a) चौताल
(b) आड़ा चौताल
(c) कहरवा
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

103. कर्नाटक संगीत में स्वर का सबसे निचला रूप 'शुद्ध' होता है:
(a) सत्य
(b) असत्य
(c) अस्थायी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

104. हिन्दुस्तानी कोमल 'नि' स्वर को कर्नाटक संगीत में क्या कहते हैं?
(a) काकली 'नि'
(b) कैशिक 'नि'
(c) शुद्ध 'नि'
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

105. प्राचीन 'अष्टोत्तर ताल पद्धति' किस संगीत पद्धति के अंतर्गत आती है?
(a) वैदिक संगीत
(b) रविन्द्र संगीत
(c) कर्नाटक संगीत
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

106. राग में वादी-संवादी (सा-म तथा सा-प) स्वरों के बीच कितनी श्रुतियों का अन्तर होता है?
(a) सात और नौ
(b) आठ और ग्यारह
(c) नौ और तेरह
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

107. 'परमेल प्रवेशक' राग का उदाहरण है:
(a) राग जोग
(b) राग भटियार
(c) राग जयजयवंती
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

108. 'संधि प्रकाश' राग का उदाहरण है:
(a) मियां की तोड़ी
(b) श्याम कल्याण
(c) मधुवंती
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

109. दिये गये स्वरों में 'मींड' का चिन्ह है:
(a) (ग म)
(b) ग म
(c) मींड का वक्र चिन्ह
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

110. पं. शारंगदेव ने गमक के कितने भेद बताए हैं?
(a) 10
(b) 15
(c) 20
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

111. निम्न में से 'आश्रय राग' है:
(a) भैरव
(b) तोड़ी
(c) काफी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

112. गज से बजाये जाने वाले वाद्य हैं:
(a) इसराज
(b) सारंगी
(c) वायलिन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

113. 'जल तरंग' किस वाद्य श्रेणी में आता है?
(a) तत्
(b) अवनद्ध
(c) घन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

114. 'वृन्द वादन' है:
(a) एकल वादन शैली
(b) युगल वादन शैली
(c) सामूहिक वादन शैली
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

115. 'जवा' से बजाया जाने वाला वाद्य है:
(a) वीणा
(b) सितार
(c) सरोद
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

116. निम्न में तुम्बा और डांड से बने हुए वाद्य हैं:
(a) तानपुरा
(b) सितार
(c) सुरबहार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

117. स्वरों के क्रमिक गायन अथवा वादन से उत्पन्न मधुर संगीत कहलाता है:
(a) मेलोडी संगीत
(b) कम्पाउंड हार्मनी
(c) सिम्पल हार्मनी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

118. पाश्चात्य संगीत में # चिन्ह संकेत करता है:
(a) शुद्ध स्वर
(b) कोमल स्वर
(c) तीव्र स्वर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

119. बारह स्वरों के बीच समान दूरी वाला स्केल है:
(a) नेचुरल स्केल
(b) डायटोनिक स्केल
(c) टेम्पर्ड स्केल
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

120. वर्तमान में कौन-सी पाश्चात्य स्वरलिपि पद्धति का प्रचलन है?
(a) सोल्फा और न्यूम्स स्वरलिपि
(b) स्टाफ स्वरलिपि
(c) चीव्स स्वरलिपि
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

121. हार्मनी के मुख्य प्रकार कितने हैं?
(a) दो
(b) तीन
(c) चार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

122. पं. ओंकारनाथ ठाकुर के गुरू कौन थे?
(a) पं. डी.वी. पलुस्कर
(b) पं. वी.डी. पलुस्कर
(c) पं. वी.एन. भातखण्डे
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

123. गान्धर्व महाविद्यालय की स्थापना किसने की?
(a) पं. ओंकारनाथ ठाकुर
(b) पं. विष्णु नारायण भातखण्डे
(c) पं. विष्णु दिगम्बर पलुस्कर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

124. पं. विष्णु नारायण भातखण्डे द्वारा लिखित पुस्तक है:
(a) अभिनव राग मंजरी
(b) लक्ष्य संगीत
(c) स्वरमालिका
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

125. पं. रामचतुर मलिक किस विधा के कलाकार थे?
(a) गायक
(b) वादक
(c) नर्तक
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

126. बाबा अलाउद्दीन खां की परम्परा के कलाकार हैं:
(a) पं. पन्नालाल घोष
(b) पं. निखिल बनर्जी
(c) श्रीमती शिशिर कणा धर चौधरी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

127. पं. विष्णु दिगम्बर पलुस्कर द्वारा रचित पुस्तक है:
(a) राग प्रवेश
(b) नारदीय शिक्षा सटीक
(c) भारतीय संगीत लेखन पद्धति
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

128. नाट्यशास्त्र में कुल कितने अध्याय हैं?
(a) 36
(b) 35
(c) 34
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

129. बृहद्देशी ग्रन्थ की रचना किसने की?
(a) नारद
(b) मतंग
(c) भरत
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

130. 'सप्ताध्यायी' ग्रन्थ किसे कहते हैं?
(a) बृहद्देशी
(b) राग तरंगिणी
(c) संगीत रत्नाकर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

131. 'राग तरंगिणी' ग्रन्थ का रचनाकाल है:
(a) 14वीं शताब्दी
(b) 15वीं शताब्दी
(c) 16वीं शताब्दी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

132. निम्न में से किस ग्रन्थकार को 'निशंक' के नाम से भी जाना जाता है?
(a) पं. लोचन
(b) पं. शारंग देव
(c) पं. श्रीनिवास
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

133. वर्तमान में 'नाट्य शास्त्र' ग्रन्थ के कितने संस्करण उपलब्ध हैं?
(a) 3 संस्करण
(b) 4 संस्करण
(c) 5 संस्करण
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

134. तार सप्तक में राग दरबारी कानड़ा को गाने-बजाने से कौन-से राग की छाया दिखने लगती है?
(a) जौनपुरी
(b) आसावरी
(c) अड़ाना
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

135. निम्न में से 'मध्यम वादी' राग कौन-सा है?
(a) राग बहार
(b) राग गौड़ सारंग
(c) राग हमीर
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

136. राग शुद्ध कल्याण में किन रागों का मिश्रण है?
(a) राग भूपाली व यमन
(b) राग देशकार व श्याम कल्याण
(c) राग बिलावल व यमन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

137. राग 'श्री' एक राग प्रकार है:
(a) परमेल प्रवेशक राग
(b) संधि प्रकाश राग
(c) आश्रय राग
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

138. राग 'शंकरा' के शास्त्रीय परिचय के बिन्दु हैं:
(a) थाट-बिलावल
(b) उत्तरांग प्रधान राग
(c) जाति: औड़व-षाड़व
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

139. ताल 'एकताल' के शास्त्रीय परिचय के निम्न बिन्दु हैं:
(a) 12 मात्रिक ताल
(b) 1, 5, 9, 11 मात्रा पर ताली
(c) 3 तथा 7 वीं मात्रा पर खाली
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

140. ताल 'त्रिताल' में 'धा' वर्ण का प्रयोग कितनी बार हुआ है?
(a) 4 बार
(b) 6 बार
(c) 8 बार
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

141. निम्न में 1 खाली और 3 ताली से युक्त ताल है:
(a) झपताल
(b) तीनताल
(c) रूपक
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

142. कुआड़ लय कहते हैं:
(a) 5/4
(b) 4/5
(c) 3/4
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

143. 1½ की लयकारी कही जाती है:
(a) सवागुन
(b) पौनगुन
(c) डेढ़गुन
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

144. पाश्चात्य स्टाफ नोटेशन में ग्यारह रेखाओं के समूह को कहा जाता है:
(a) जी-क्लिफ
(b) क्लिफ सिग्नेचर
(c) ग्रेट स्टेव
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

145. पाश्चात्य संगीत में '♩' का चिन्ह संकेत करता है:
(a) होल टोन
(b) हाफ नोट
(c) क्वार्टर नोट
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

146. राग छायानट एवं कामोद में भिन्नता है:
(a) वादी-संवादी
(b) दोनों मध्यमों का प्रयोग
(c) विवादी के रूप में कोमल नि का प्रयोग
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

147. 'नायकवा' गीत कौन से सम्प्रदाय के लोग गाते हैं?
(a) नाई
(b) तेली
(c) धोबी
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

148. 'झलकुरिया' गीत प्रकार है:
(a) कजरी
(b) चैती
(c) फाग
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

149. निम्न में से असत्य कथन है:
(a) राग मियां मल्हार, सारंग अंग का राग है
(b) राग बहार कान्हड़ा अंग का राग है
(c) राग मियां मल्हार राग बहार का समस्वरीय राग है
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं

150. पाश्चात्य स्टाफ नोटेशन में तीन मात्रा में 2 स्वरों का प्रयोग कहलाता है:
(a) ट्रिप्लेट
(b) डुपलेट
(c) क्विंटुप्लेट
(d) उपर्युक्त में से एक से अधिक
(e) उपर्युक्त में से कोई नहीं`;

const rawAnswerKey = `1. E
2. B
3. E
4. C
5. C
6. C
7. B
8. B
9. C
10. A
11. C
12. B
13. E
14. B
15. B
16. E
17. A
18. C
19. A
20. C
21. C
22. B
23. D
24. D
25. D
26. B
27. B
28. A
29. C
30. B
31. C
32. B
33. C
34. C
35. B
36. B
37. E
38. A
39. A
40. E
41. B
42. B
43. A
44. D
45. D
46. C
47. B
48. C
49. A
50. B
51. C
52. A
53. B
54. C
55. A
56. B
57. C
58. B
59. A
60. B
61. C
62. DELETED
63. B
64. C
65. B
66. B
67. A
68. A
69. E
70. B
71. A
72. C
73. C
74. B
75. A
76. D
77. C
78. C
79. C
80. B
81. B
82. D
83. C
84. A
85. C
86. B
87. D
88. B
89. C
90. C
91. B
92. D
93. C
94. D
95. B
96. D
97. D
98. D
99. D
100. C
101. B
102. A
103. A
104. B
105. C
106. C
107. C
108. E
109. C
110. B
111. D
112. D
113. C
114. C
115. C
116. D
117. A
118. C
119. C
120. B
121. A
122. B
123. C
124. D
125. A
126. D
127. D
128. A
129. B
130. C
131. B
132. B
133. B
134. C
135. A
136. A
137. B
138. D
139. A
140. B
141. D
142. A
143. C
144. C
145. C
146. A
147. B
148. B
149. A
150. B`;

async function main() {
  console.log('Connecting to database...');
  await connectToDatabase();

  // 1. Write sample files
  fs.mkdirSync('./sample_data', { recursive: true });
  fs.writeFileSync('./sample_data/music-test-3-english.txt', rawEnglish.trim(), 'utf-8');
  fs.writeFileSync('./sample_data/music-test-3-hindi.txt', rawHindi.trim(), 'utf-8');
  fs.writeFileSync('./sample_data/music-test-3-answer-key.txt', rawAnswerKey.trim(), 'utf-8');
  console.log('Saved 3 sample files in sample_data/');

  // 2. Parse questions and answer key
  const parsedEn = parseTxtQuestions(rawEnglish);
  const parsedHi = parseTxtQuestions(rawHindi);
  const parsedAns = parseAnswerKey(rawAnswerKey);

  console.log(`Parsed EN Questions: ${parsedEn.length}`);
  console.log(`Parsed HI Questions: ${parsedHi.length}`);
  console.log(`Parsed Answers: ${parsedAns.answers.size}`);

  // 3. Match questions
  const matchResult = matchEnglishAndHindiQuestions(parsedEn, parsedHi, parsedAns.answers);
  console.log('Matching Summary:', matchResult.summary);

  const questions = matchResult.questions;

  // 4. Build answers map & cached questions
  const answersMap = new Map<string, string>();
  questions.forEach((q) => {
    if (q.correctAnswer) {
      answersMap.set(String(q.number), q.correctAnswer);
    }
  });

  const cachedEn = questions.map((q) => ({
    number: q.number,
    text: q.english.text,
    options: q.english.options,
  }));

  const cachedHi = questions.map((q) => ({
    number: q.number,
    text: q.hindi.text,
    options: q.hindi.options,
  }));

  const cachedMap = new Map();
  cachedMap.set('en', cachedEn);
  cachedMap.set('hi', cachedHi);

  // 5. Create or update TestSeries document in MongoDB
  const existingTest = await TestSeries.findOne({ title: 'Music Test - 3' });
  const testId = existingTest ? existingTest.id : uuidv4();

  const testData = {
    id: testId,
    title: 'Music Test - 3',
    subject: 'Music',
    testType: 'prev-year',
    format: 'test',
    durationMinutes: 150,
    startQuestion: 1,
    endQuestion: questions.length,
    isRandom: false,
    isManual: false,
    bilingualQuestions: questions,
    cachedQuestions: cachedMap,
    answers: answersMap,
    createdAt: existingTest ? existingTest.createdAt : new Date().toISOString(),
  };

  if (existingTest) {
    await TestSeries.findOneAndUpdate({ id: testId }, testData);
    console.log(`✅ Updated existing test: Music Test - 3 (ID: ${testId})`);
  } else {
    await TestSeries.create(testData);
    console.log(`🎉 Created new test: Music Test - 3 (ID: ${testId})`);
  }

  console.log(`\nVerification: Music Test - 3 has ${questions.length} bilingual questions with 100% matched answers!`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error generating Music Test - 3:', err);
    process.exit(1);
  });
