import json
import os
import glob

en_texts = {
    "pathToLightBismillahSecondary": "\"In the name of Allah, the Most Compassionate, the Most Merciful\"",
    "pathToLightSubtitle": "The Path To The Light",
    "pathToLightP1": "Îmân is to believe together in the two parts of the word of tawhid, “Lâ ilâhe illallah” and “Muhammadun Rasûlallah.” That is, in order to be a Muslim, it is also necessary to believe that Muhammad (Sallallahu Alayhi wa Sallam) is a Prophet. That is, Muhammad (Sallallahu Alayhi wa Sallam) is the Prophet of Allah ﷻ. Allah ﷻ, through the angel named Jibril (Alayhi s-salam), sent down to him the (Qur'an al-karim). This Qur'an al-karim is the Word of Allah ﷻ.",
    "pathToLightP2": "It is not the personal thoughts of Muhammad (Sallallahu Alayhi wa Sallam), nor the words of philosophers or historians. Muhammad (Sallallahu Alayhi wa Sallam) made tafsir of the Qur'an al-karim. That is, he explained it. These explanations are called (Hadith ash-sharif). Islam consists of the (Qur'an al-karim) and the (Hadith ash-sharif). The millions of Islamic books in every part of the world are explanations of the (Qur'an al-karim) and the (Hadith ash-sharif). A statement that does not come from Muhammad (Sallallahu Alayhi wa Sallam) cannot be an Islamic book.",
    "pathToLightP3": "Îmân and Islam mean to believe in the (Qur'an al-karim) and the (Hadith ash-sharif). One who does not believe in what he communicated will not have believed in the Word of Allah ﷻ. Muhammad (Sallallahu Alayhi wa Sallam) conveyed what Allah ﷻ revealed to his Companions (Radiyallahu Anhum). They, in turn, conveyed it to their students. These also wrote them in their books. The scholars who wrote these books are called (Ahl as-Sunnah scholars). One who believes in the books of Ahl as-Sunnah will have believed in the Word of Allah ﷻ. He becomes a Muslim.",
    "pathToLightP4": "Inshaallah, we also wish to introduce you to these valuable books and the blessed Islamic scholars who prepared them through the path of knowledge and love."
}

tr_texts = {
    "pathToLightBismillahSecondary": "",
    "pathToLightSubtitle": "NURA GİDEN YOL",
    "pathToLightP1": "\"Îmân, kelime-i tevhîdin (Lâ ilâhe illallah ve Muhammedün Resûlullah) iki kısmına birlikde inanmakdır. Ya'nî, müslimân olmak için, Muhammed aleyhisselâmın Peygamber olduğuna da inanmak lâzımdır. Ya'nî Muhammed aleyhisselâm, Allahın Peygamberidir. Allahü teâlâ, Cebrâîl ismindeki melek ile, kendisine (Kur'ân-ı kerîm)i göndermişdir. Bu Kur'ân-ı kerîm, Allah kelâmıdır.",
    "pathToLightP2": "Muhammed aleyhisselâmın kendi düşünceleri ve felsefecilerin, târîhcilerin sözleri değildir. Muhammed aleyhisselâm, Kur'ân-ı kerîmi tefsîr etmişdir. Ya'nî açıklamışdır. Bu açıklamalara, (Hadîs-i şerîf) denir. İslâmiyyet, (Kur'ân-ı kerîm) ile (Hadîs-i şerîf)lerdir. Dünyânın her yerindeki, milyonlarca islâm kitâbı, (Kur'ân-ı kerîm) ile (Hadîs-i şerîf)lerin açıklamalarıdır. Muhammed aleyhisselâmdan gelmiyen bir söz, islâm kitâbı olamaz.",
    "pathToLightP3": "Îmân ve islâm demek, (Kur'ân-ı kerîm) ve (Hadîs-i şerîf)lere inanmak demekdir. Onun bildirdiklerine inanmıyan, Allah kelâmına inanmamış olur. Muhammed aleyhisselâm Allahü teâlânın bildirdiklerini Eshâbına bildirdi. Onlar da, talebelerine bildirdi. Bunlar da, kitâblarına yazdılar. Bu kitâbları yazan âlimlere (Ehl-i sünnet âlimi) denir. Ehl-i sünnet kitâblarına inanan, Allah kelâmına inanmış olur. Müslimân olur.",
    "pathToLightP4": "Bizde sizleri ilim ve sevgi yolundan bu kıymetli kitaplarla ve bu kitapları hazırlayan mübarek İslam Alimleri ile tanıştırmak istiyoruz.\""
}

json_files = glob.glob('*.json')
for file in json_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'auth' not in data:
            data['auth'] = {}
            
        if file == 'tr.json':
            for k, v in tr_texts.items():
                data['auth'][k] = v
        else:
            # Fallback to English for en.json and all other languages
            # Usually they are translated later by another script
            for k, v in en_texts.items():
                data['auth'][k] = v
                
        with open(file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"Updated {file}")
    except Exception as e:
        print(f"Error on {file}: {e}")
