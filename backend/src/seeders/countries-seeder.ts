import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../countries/entities/country.entity';
import { Language } from '../languages/entities/language.entity';

export interface CountrySeed {
  alpha2: string;
  name: string;
  nameTr: string;
  primaryLangCode: string | null;
}

/**
 * ISO 3166-1 alpha-2 ülke listesi (kullanıcının onayladığı 178 ülke).
 * Her ülke için en yaygın / resmi birincil dilin ISO 639-1 kodu (`languages.code`) atanır.
 * Bayraklar flagcdn.com'dan beslenir: https://flagcdn.com/w80/{alpha2.lower}.png
 *
 * Not: Eğer `primaryLangCode`, mevcut `languages` tablosunda bulunamazsa
 *      `primaryLanguageId` null olarak bırakılır (uyarı loglanır).
 */
export const COUNTRY_SEED: CountrySeed[] = [
  { alpha2: 'AF', name: 'Afghanistan', nameTr: 'Afganistan', primaryLangCode: 'fa' },
  { alpha2: 'AX', name: 'Åland Islands', nameTr: 'Åland Adaları', primaryLangCode: 'sv' },
  { alpha2: 'AL', name: 'Albania', nameTr: 'Arnavutluk', primaryLangCode: 'sq' },
  { alpha2: 'DZ', name: 'Algeria', nameTr: 'Cezayir', primaryLangCode: 'ar' },
  { alpha2: 'AS', name: 'American Samoa', nameTr: 'Amerikan Samoası', primaryLangCode: 'en' },
  { alpha2: 'AD', name: 'Andorra', nameTr: 'Andorra', primaryLangCode: 'ca' },
  { alpha2: 'AO', name: 'Angola', nameTr: 'Angola', primaryLangCode: 'pt' },
  { alpha2: 'AI', name: 'Anguilla', nameTr: 'Anguilla', primaryLangCode: 'en' },
  { alpha2: 'AQ', name: 'Antarctica', nameTr: 'Antarktika', primaryLangCode: 'en' },
  { alpha2: 'AG', name: 'Antigua and Barbuda', nameTr: 'Antigua ve Barbuda', primaryLangCode: 'en' },
  { alpha2: 'AR', name: 'Argentina', nameTr: 'Arjantin', primaryLangCode: 'es' },
  { alpha2: 'AM', name: 'Armenia', nameTr: 'Ermenistan', primaryLangCode: 'hy' },
  { alpha2: 'AW', name: 'Aruba', nameTr: 'Aruba', primaryLangCode: 'nl' },
  { alpha2: 'AU', name: 'Australia', nameTr: 'Avustralya', primaryLangCode: 'en' },
  { alpha2: 'AT', name: 'Austria', nameTr: 'Avusturya', primaryLangCode: 'de' },
  { alpha2: 'AZ', name: 'Azerbaijan', nameTr: 'Azerbaycan', primaryLangCode: 'az' },
  { alpha2: 'BS', name: 'Bahamas', nameTr: 'Bahamalar', primaryLangCode: 'en' },
  { alpha2: 'BH', name: 'Bahrain', nameTr: 'Bahreyn', primaryLangCode: 'ar' },
  { alpha2: 'BD', name: 'Bangladesh', nameTr: 'Bangladeş', primaryLangCode: 'bn' },
  { alpha2: 'BB', name: 'Barbados', nameTr: 'Barbados', primaryLangCode: 'en' },
  { alpha2: 'BY', name: 'Belarus', nameTr: 'Belarus', primaryLangCode: 'be' },
  { alpha2: 'BE', name: 'Belgium', nameTr: 'Belçika', primaryLangCode: 'nl' },
  { alpha2: 'BZ', name: 'Belize', nameTr: 'Belize', primaryLangCode: 'en' },
  { alpha2: 'BJ', name: 'Benin', nameTr: 'Benin', primaryLangCode: 'fr' },
  { alpha2: 'BM', name: 'Bermuda', nameTr: 'Bermuda', primaryLangCode: 'en' },
  { alpha2: 'BT', name: 'Bhutan', nameTr: 'Butan', primaryLangCode: 'dz' },
  { alpha2: 'BO', name: 'Bolivia', nameTr: 'Bolivya', primaryLangCode: 'es' },
  { alpha2: 'BQ', name: 'Bonaire, Sint Eustatius and Saba', nameTr: 'Bonaire, Sint Eustatius ve Saba', primaryLangCode: 'nl' },
  { alpha2: 'BA', name: 'Bosnia and Herzegovina', nameTr: 'Bosna-Hersek', primaryLangCode: 'bs' },
  { alpha2: 'BW', name: 'Botswana', nameTr: 'Botsvana', primaryLangCode: 'en' },
  { alpha2: 'BR', name: 'Brazil', nameTr: 'Brezilya', primaryLangCode: 'pt' },
  { alpha2: 'IO', name: 'British Indian Ocean Territory', nameTr: 'Britanya Hint Okyanusu Toprakları', primaryLangCode: 'en' },
  { alpha2: 'BN', name: 'Brunei Darussalam', nameTr: 'Brunei', primaryLangCode: 'ms' },
  { alpha2: 'BG', name: 'Bulgaria', nameTr: 'Bulgaristan', primaryLangCode: 'bg' },
  { alpha2: 'BF', name: 'Burkina Faso', nameTr: 'Burkina Faso', primaryLangCode: 'fr' },
  { alpha2: 'BI', name: 'Burundi', nameTr: 'Burundi', primaryLangCode: 'rn' },
  { alpha2: 'KH', name: 'Cambodia', nameTr: 'Kamboçya', primaryLangCode: 'km' },
  { alpha2: 'CM', name: 'Cameroon', nameTr: 'Kamerun', primaryLangCode: 'fr' },
  { alpha2: 'CA', name: 'Canada', nameTr: 'Kanada', primaryLangCode: 'en' },
  { alpha2: 'CV', name: 'Cape Verde', nameTr: 'Cape Verde', primaryLangCode: 'pt' },
  { alpha2: 'KY', name: 'Cayman Islands', nameTr: 'Cayman Adaları', primaryLangCode: 'en' },
  { alpha2: 'CF', name: 'Central African Republic', nameTr: 'Orta Afrika Cumhuriyeti', primaryLangCode: 'fr' },
  { alpha2: 'TD', name: 'Chad', nameTr: 'Çad', primaryLangCode: 'fr' },
  { alpha2: 'CL', name: 'Chile', nameTr: 'Şili', primaryLangCode: 'es' },
  { alpha2: 'CN', name: 'China', nameTr: 'Çin', primaryLangCode: 'zh' },
  { alpha2: 'CX', name: 'Christmas Island', nameTr: 'Christmas Adası', primaryLangCode: 'en' },
  { alpha2: 'CC', name: 'Cocos (Keeling) Islands', nameTr: 'Cocos (Keeling) Adaları', primaryLangCode: 'en' },
  { alpha2: 'CO', name: 'Colombia', nameTr: 'Kolombiya', primaryLangCode: 'es' },
  { alpha2: 'KM', name: 'Comoros', nameTr: 'Komorlar', primaryLangCode: 'ar' },
  { alpha2: 'CG', name: 'Congo', nameTr: 'Kongo', primaryLangCode: 'fr' },
  { alpha2: 'CD', name: 'Congo, Democratic Republic of the', nameTr: 'Demokratik Kongo Cumhuriyeti', primaryLangCode: 'fr' },
  { alpha2: 'CR', name: 'Costa Rica', nameTr: 'Kosta Rika', primaryLangCode: 'es' },
  { alpha2: 'CI', name: "Côte d'Ivoire", nameTr: 'Fildişi Sahili', primaryLangCode: 'fr' },
  { alpha2: 'HR', name: 'Croatia', nameTr: 'Hırvatistan', primaryLangCode: 'hr' },
  { alpha2: 'CU', name: 'Cuba', nameTr: 'Küba', primaryLangCode: 'es' },
  { alpha2: 'CW', name: 'Curaçao', nameTr: 'Curaçao', primaryLangCode: 'nl' },
  { alpha2: 'CY', name: 'Cyprus', nameTr: 'Kıbrıs', primaryLangCode: 'el' },
  { alpha2: 'CZ', name: 'Czechia', nameTr: 'Çekya', primaryLangCode: 'cs' },
  { alpha2: 'DK', name: 'Denmark', nameTr: 'Danimarka', primaryLangCode: 'da' },
  { alpha2: 'DJ', name: 'Djibouti', nameTr: 'Cibuti', primaryLangCode: 'fr' },
  { alpha2: 'DM', name: 'Dominica', nameTr: 'Dominika', primaryLangCode: 'en' },
  { alpha2: 'DO', name: 'Dominican Republic', nameTr: 'Dominik Cumhuriyeti', primaryLangCode: 'es' },
  { alpha2: 'EC', name: 'Ecuador', nameTr: 'Ekvador', primaryLangCode: 'es' },
  { alpha2: 'EG', name: 'Egypt', nameTr: 'Mısır', primaryLangCode: 'ar' },
  { alpha2: 'SV', name: 'El Salvador', nameTr: 'El Salvador', primaryLangCode: 'es' },
  { alpha2: 'GQ', name: 'Equatorial Guinea', nameTr: 'Ekvator Ginesi', primaryLangCode: 'es' },
  { alpha2: 'ER', name: 'Eritrea', nameTr: 'Eritre', primaryLangCode: 'ti' },
  { alpha2: 'EE', name: 'Estonia', nameTr: 'Estonya', primaryLangCode: 'et' },
  { alpha2: 'SZ', name: 'Eswatini', nameTr: 'Esvatini', primaryLangCode: 'en' },
  { alpha2: 'ET', name: 'Ethiopia', nameTr: 'Etiyopya', primaryLangCode: 'am' },
  { alpha2: 'FK', name: 'Falkland Islands', nameTr: 'Falkland Adaları', primaryLangCode: 'en' },
  { alpha2: 'FO', name: 'Faroe Islands', nameTr: 'Faroe Adaları', primaryLangCode: 'fo' },
  { alpha2: 'FJ', name: 'Fiji', nameTr: 'Fiji', primaryLangCode: 'en' },
  { alpha2: 'FI', name: 'Finland', nameTr: 'Finlandiya', primaryLangCode: 'fi' },
  { alpha2: 'FR', name: 'France', nameTr: 'Fransa', primaryLangCode: 'fr' },
  { alpha2: 'GE', name: 'Georgia', nameTr: 'Gürcistan', primaryLangCode: 'ka' },
  { alpha2: 'DE', name: 'Germany', nameTr: 'Almanya', primaryLangCode: 'de' },
  { alpha2: 'GH', name: 'Ghana', nameTr: 'Gana', primaryLangCode: 'en' },
  { alpha2: 'GR', name: 'Greece', nameTr: 'Yunanistan', primaryLangCode: 'el' },
  { alpha2: 'GL', name: 'Greenland', nameTr: 'Grönland', primaryLangCode: 'kl' },
  { alpha2: 'GD', name: 'Grenada', nameTr: 'Grenada', primaryLangCode: 'en' },
  { alpha2: 'GT', name: 'Guatemala', nameTr: 'Guatemala', primaryLangCode: 'es' },
  { alpha2: 'GN', name: 'Guinea', nameTr: 'Gine', primaryLangCode: 'fr' },
  { alpha2: 'GW', name: 'Guinea-Bissau', nameTr: 'Gine-Bissau', primaryLangCode: 'pt' },
  { alpha2: 'GY', name: 'Guyana', nameTr: 'Guyana', primaryLangCode: 'en' },
  { alpha2: 'HT', name: 'Haiti', nameTr: 'Haiti', primaryLangCode: 'fr' },
  { alpha2: 'HN', name: 'Honduras', nameTr: 'Honduras', primaryLangCode: 'es' },
  { alpha2: 'HK', name: 'Hong Kong', nameTr: 'Hong Kong', primaryLangCode: 'zh' },
  { alpha2: 'HU', name: 'Hungary', nameTr: 'Macaristan', primaryLangCode: 'hu' },
  { alpha2: 'IS', name: 'Iceland', nameTr: 'İzlanda', primaryLangCode: 'is' },
  { alpha2: 'IN', name: 'India', nameTr: 'Hindistan', primaryLangCode: 'hi' },
  { alpha2: 'ID', name: 'Indonesia', nameTr: 'Endonezya', primaryLangCode: 'id' },
  { alpha2: 'IR', name: 'Iran', nameTr: 'İran', primaryLangCode: 'fa' },
  { alpha2: 'IQ', name: 'Iraq', nameTr: 'Irak', primaryLangCode: 'ar' },
  { alpha2: 'IE', name: 'Ireland', nameTr: 'İrlanda', primaryLangCode: 'en' },
  { alpha2: 'IL', name: 'Israel', nameTr: 'İsrail', primaryLangCode: 'he' },
  { alpha2: 'IT', name: 'Italy', nameTr: 'İtalya', primaryLangCode: 'it' },
  { alpha2: 'JM', name: 'Jamaica', nameTr: 'Jamaika', primaryLangCode: 'en' },
  { alpha2: 'JP', name: 'Japan', nameTr: 'Japonya', primaryLangCode: 'ja' },
  { alpha2: 'JO', name: 'Jordan', nameTr: 'Ürdün', primaryLangCode: 'ar' },
  { alpha2: 'KZ', name: 'Kazakhstan', nameTr: 'Kazakistan', primaryLangCode: 'kk' },
  { alpha2: 'KE', name: 'Kenya', nameTr: 'Kenya', primaryLangCode: 'sw' },
  { alpha2: 'KR', name: 'Korea, Republic of', nameTr: 'Güney Kore', primaryLangCode: 'ko' },
  { alpha2: 'KW', name: 'Kuwait', nameTr: 'Kuveyt', primaryLangCode: 'ar' },
  { alpha2: 'KG', name: 'Kyrgyzstan', nameTr: 'Kırgızistan', primaryLangCode: 'ky' },
  { alpha2: 'LA', name: "Lao People's Democratic Republic", nameTr: 'Laos', primaryLangCode: 'lo' },
  { alpha2: 'LV', name: 'Latvia', nameTr: 'Letonya', primaryLangCode: 'lv' },
  { alpha2: 'LB', name: 'Lebanon', nameTr: 'Lübnan', primaryLangCode: 'ar' },
  { alpha2: 'LS', name: 'Lesotho', nameTr: 'Lesotho', primaryLangCode: 'en' },
  { alpha2: 'LR', name: 'Liberia', nameTr: 'Liberya', primaryLangCode: 'en' },
  { alpha2: 'LY', name: 'Libya', nameTr: 'Libya', primaryLangCode: 'ar' },
  { alpha2: 'LI', name: 'Liechtenstein', nameTr: 'Lihtenştayn', primaryLangCode: 'de' },
  { alpha2: 'LT', name: 'Lithuania', nameTr: 'Litvanya', primaryLangCode: 'lt' },
  { alpha2: 'LU', name: 'Luxembourg', nameTr: 'Lüksemburg', primaryLangCode: 'fr' },
  { alpha2: 'MO', name: 'Macao', nameTr: 'Makao', primaryLangCode: 'zh' },
  { alpha2: 'MG', name: 'Madagascar', nameTr: 'Madagaskar', primaryLangCode: 'mg' },
  { alpha2: 'MW', name: 'Malawi', nameTr: 'Malavi', primaryLangCode: 'en' },
  { alpha2: 'MY', name: 'Malaysia', nameTr: 'Malezya', primaryLangCode: 'ms' },
  { alpha2: 'MV', name: 'Maldives', nameTr: 'Maldivler', primaryLangCode: 'dv' },
  { alpha2: 'ML', name: 'Mali', nameTr: 'Mali', primaryLangCode: 'fr' },
  { alpha2: 'MT', name: 'Malta', nameTr: 'Malta', primaryLangCode: 'mt' },
  { alpha2: 'MH', name: 'Marshall Islands', nameTr: 'Marshall Adaları', primaryLangCode: 'en' },
  { alpha2: 'MR', name: 'Mauritania', nameTr: 'Moritanya', primaryLangCode: 'ar' },
  { alpha2: 'MU', name: 'Mauritius', nameTr: 'Mauritius', primaryLangCode: 'en' },
  { alpha2: 'MX', name: 'Mexico', nameTr: 'Meksika', primaryLangCode: 'es' },
  { alpha2: 'MD', name: 'Moldova', nameTr: 'Moldova', primaryLangCode: 'ro' },
  { alpha2: 'MC', name: 'Monaco', nameTr: 'Monako', primaryLangCode: 'fr' },
  { alpha2: 'MN', name: 'Mongolia', nameTr: 'Moğolistan', primaryLangCode: 'mn' },
  { alpha2: 'ME', name: 'Montenegro', nameTr: 'Karadağ', primaryLangCode: 'sr' },
  { alpha2: 'MA', name: 'Morocco', nameTr: 'Fas', primaryLangCode: 'ar' },
  { alpha2: 'MZ', name: 'Mozambique', nameTr: 'Mozambik', primaryLangCode: 'pt' },
  { alpha2: 'MM', name: 'Myanmar', nameTr: 'Myanmar', primaryLangCode: 'my' },
  { alpha2: 'NA', name: 'Namibia', nameTr: 'Namibya', primaryLangCode: 'en' },
  { alpha2: 'NP', name: 'Nepal', nameTr: 'Nepal', primaryLangCode: 'ne' },
  { alpha2: 'NL', name: 'Netherlands', nameTr: 'Hollanda', primaryLangCode: 'nl' },
  { alpha2: 'NZ', name: 'New Zealand', nameTr: 'Yeni Zelanda', primaryLangCode: 'en' },
  { alpha2: 'NI', name: 'Nicaragua', nameTr: 'Nikaragua', primaryLangCode: 'es' },
  { alpha2: 'NE', name: 'Niger', nameTr: 'Nijer', primaryLangCode: 'fr' },
  { alpha2: 'NG', name: 'Nigeria', nameTr: 'Nijerya', primaryLangCode: 'en' },
  { alpha2: 'NO', name: 'Norway', nameTr: 'Norveç', primaryLangCode: 'no' },
  { alpha2: 'OM', name: 'Oman', nameTr: 'Umman', primaryLangCode: 'ar' },
  { alpha2: 'PK', name: 'Pakistan', nameTr: 'Pakistan', primaryLangCode: 'ur' },
  { alpha2: 'PA', name: 'Panama', nameTr: 'Panama', primaryLangCode: 'es' },
  { alpha2: 'PG', name: 'Papua New Guinea', nameTr: 'Papua Yeni Gine', primaryLangCode: 'en' },
  { alpha2: 'PY', name: 'Paraguay', nameTr: 'Paraguay', primaryLangCode: 'es' },
  { alpha2: 'PE', name: 'Peru', nameTr: 'Peru', primaryLangCode: 'es' },
  { alpha2: 'PH', name: 'Philippines', nameTr: 'Filipinler', primaryLangCode: 'tl' },
  { alpha2: 'PL', name: 'Poland', nameTr: 'Polonya', primaryLangCode: 'pl' },
  { alpha2: 'PT', name: 'Portugal', nameTr: 'Portekiz', primaryLangCode: 'pt' },
  { alpha2: 'QA', name: 'Qatar', nameTr: 'Katar', primaryLangCode: 'ar' },
  { alpha2: 'RO', name: 'Romania', nameTr: 'Romanya', primaryLangCode: 'ro' },
  { alpha2: 'RU', name: 'Russian Federation', nameTr: 'Rusya Federasyonu', primaryLangCode: 'ru' },
  { alpha2: 'RW', name: 'Rwanda', nameTr: 'Ruanda', primaryLangCode: 'rw' },
  { alpha2: 'SA', name: 'Saudi Arabia', nameTr: 'Suudi Arabistan', primaryLangCode: 'ar' },
  { alpha2: 'SN', name: 'Senegal', nameTr: 'Senegal', primaryLangCode: 'fr' },
  { alpha2: 'RS', name: 'Serbia', nameTr: 'Sırbistan', primaryLangCode: 'sr' },
  { alpha2: 'SG', name: 'Singapore', nameTr: 'Singapur', primaryLangCode: 'en' },
  { alpha2: 'SK', name: 'Slovakia', nameTr: 'Slovakya', primaryLangCode: 'sk' },
  { alpha2: 'SI', name: 'Slovenia', nameTr: 'Slovenya', primaryLangCode: 'sl' },
  { alpha2: 'ZA', name: 'South Africa', nameTr: 'Güney Afrika', primaryLangCode: 'en' },
  { alpha2: 'ES', name: 'Spain', nameTr: 'İspanya', primaryLangCode: 'es' },
  { alpha2: 'LK', name: 'Sri Lanka', nameTr: 'Sri Lanka', primaryLangCode: 'si' },
  { alpha2: 'SD', name: 'Sudan', nameTr: 'Sudan', primaryLangCode: 'ar' },
  { alpha2: 'SE', name: 'Sweden', nameTr: 'İsveç', primaryLangCode: 'sv' },
  { alpha2: 'CH', name: 'Switzerland', nameTr: 'İsviçre', primaryLangCode: 'de' },
  { alpha2: 'TH', name: 'Thailand', nameTr: 'Tayland', primaryLangCode: 'th' },
  { alpha2: 'TN', name: 'Tunisia', nameTr: 'Tunus', primaryLangCode: 'ar' },
  { alpha2: 'TR', name: 'Türkiye', nameTr: 'Türkiye', primaryLangCode: 'tr' },
  { alpha2: 'UA', name: 'Ukraine', nameTr: 'Ukrayna', primaryLangCode: 'uk' },
  { alpha2: 'AE', name: 'United Arab Emirates', nameTr: 'Birleşik Arap Emirlikleri', primaryLangCode: 'ar' },
  { alpha2: 'GB', name: 'United Kingdom', nameTr: 'Birleşik Krallık', primaryLangCode: 'en' },
  { alpha2: 'US', name: 'United States', nameTr: 'Amerika Birleşik Devletleri', primaryLangCode: 'en' },
  { alpha2: 'UY', name: 'Uruguay', nameTr: 'Uruguay', primaryLangCode: 'es' },
  { alpha2: 'UZ', name: 'Uzbekistan', nameTr: 'Özbekistan', primaryLangCode: 'uz' },
  { alpha2: 'VN', name: 'Viet Nam', nameTr: 'Vietnam', primaryLangCode: 'vi' },
  { alpha2: 'YE', name: 'Yemen', nameTr: 'Yemen', primaryLangCode: 'ar' },
  { alpha2: 'ZM', name: 'Zambia', nameTr: 'Zambiya', primaryLangCode: 'en' },
  { alpha2: 'ZW', name: 'Zimbabwe', nameTr: 'Zimbabve', primaryLangCode: 'en' },
  // ISO 3166-1 alpha-2 tamamlama (resmi ~249 koda ula\u015fmak i\u00e7in eksik 71 \u00fclke):
  { alpha2: 'BL', name: 'Saint Barthélemy', nameTr: 'Saint Barthélemy', primaryLangCode: 'fr' },
  { alpha2: 'BV', name: 'Bouvet Island', nameTr: 'Bouvet Adası', primaryLangCode: 'no' },
  { alpha2: 'CK', name: 'Cook Islands', nameTr: 'Cook Adaları', primaryLangCode: 'en' },
  { alpha2: 'EH', name: 'Western Sahara', nameTr: 'Batı Sahra', primaryLangCode: 'ar' },
  { alpha2: 'FM', name: 'Micronesia, Federated States of', nameTr: 'Mikronezya', primaryLangCode: 'en' },
  { alpha2: 'GA', name: 'Gabon', nameTr: 'Gabon', primaryLangCode: 'fr' },
  { alpha2: 'GF', name: 'French Guiana', nameTr: 'Fransız Guyanası', primaryLangCode: 'fr' },
  { alpha2: 'GG', name: 'Guernsey', nameTr: 'Guernsey', primaryLangCode: 'en' },
  { alpha2: 'GI', name: 'Gibraltar', nameTr: 'Cebelitarık', primaryLangCode: 'en' },
  { alpha2: 'GM', name: 'Gambia', nameTr: 'Gambiya', primaryLangCode: 'en' },
  { alpha2: 'GP', name: 'Guadeloupe', nameTr: 'Guadeloupe', primaryLangCode: 'fr' },
  { alpha2: 'GS', name: 'South Georgia and the South Sandwich Islands', nameTr: 'Güney Georgia ve Güney Sandwich Adaları', primaryLangCode: 'en' },
  { alpha2: 'GU', name: 'Guam', nameTr: 'Guam', primaryLangCode: 'en' },
  { alpha2: 'HM', name: 'Heard Island and McDonald Islands', nameTr: 'Heard Adası ve McDonald Adaları', primaryLangCode: 'en' },
  { alpha2: 'IM', name: 'Isle of Man', nameTr: 'Man Adası', primaryLangCode: 'en' },
  { alpha2: 'JE', name: 'Jersey', nameTr: 'Jersey', primaryLangCode: 'en' },
  { alpha2: 'KI', name: 'Kiribati', nameTr: 'Kiribati', primaryLangCode: 'en' },
  { alpha2: 'KN', name: 'Saint Kitts and Nevis', nameTr: 'Saint Kitts ve Nevis', primaryLangCode: 'en' },
  { alpha2: 'KP', name: "Korea, Democratic People's Republic of", nameTr: 'Kuzey Kore', primaryLangCode: 'ko' },
  { alpha2: 'LC', name: 'Saint Lucia', nameTr: 'Saint Lucia', primaryLangCode: 'en' },
  { alpha2: 'MF', name: 'Saint Martin (French part)', nameTr: 'Saint Martin (Fransız Tarafı)', primaryLangCode: 'fr' },
  { alpha2: 'MK', name: 'North Macedonia', nameTr: 'Kuzey Makedonya', primaryLangCode: 'mk' },
  { alpha2: 'MP', name: 'Northern Mariana Islands', nameTr: 'Kuzey Mariana Adaları', primaryLangCode: 'en' },
  { alpha2: 'MQ', name: 'Martinique', nameTr: 'Martinik', primaryLangCode: 'fr' },
  { alpha2: 'MS', name: 'Montserrat', nameTr: 'Montserrat', primaryLangCode: 'en' },
  { alpha2: 'NC', name: 'New Caledonia', nameTr: 'Yeni Kaledonya', primaryLangCode: 'fr' },
  { alpha2: 'NF', name: 'Norfolk Island', nameTr: 'Norfolk Adası', primaryLangCode: 'en' },
  { alpha2: 'NR', name: 'Nauru', nameTr: 'Nauru', primaryLangCode: 'en' },
  { alpha2: 'NU', name: 'Niue', nameTr: 'Niue', primaryLangCode: 'en' },
  { alpha2: 'PF', name: 'French Polynesia', nameTr: 'Fransız Polinezyası', primaryLangCode: 'fr' },
  { alpha2: 'PM', name: 'Saint Pierre and Miquelon', nameTr: 'Saint Pierre ve Miquelon', primaryLangCode: 'fr' },
  { alpha2: 'PN', name: 'Pitcairn', nameTr: 'Pitcairn', primaryLangCode: 'en' },
  { alpha2: 'PR', name: 'Puerto Rico', nameTr: 'Porto Riko', primaryLangCode: 'es' },
  { alpha2: 'PS', name: 'Palestine, State of', nameTr: 'Filistin Devleti', primaryLangCode: 'ar' },
  { alpha2: 'PW', name: 'Palau', nameTr: 'Palau', primaryLangCode: 'en' },
  { alpha2: 'RE', name: 'Réunion', nameTr: 'Réunion', primaryLangCode: 'fr' },
  { alpha2: 'SB', name: 'Solomon Islands', nameTr: 'Solomon Adaları', primaryLangCode: 'en' },
  { alpha2: 'SC', name: 'Seychelles', nameTr: 'Seyşeller', primaryLangCode: 'fr' },
  { alpha2: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha', nameTr: 'Saint Helena, Ascension ve Tristan da Cunha', primaryLangCode: 'en' },
  { alpha2: 'SJ', name: 'Svalbard and Jan Mayen', nameTr: 'Svalbard ve Jan Mayen', primaryLangCode: 'no' },
  { alpha2: 'SL', name: 'Sierra Leone', nameTr: 'Sierra Leone', primaryLangCode: 'en' },
  { alpha2: 'SM', name: 'San Marino', nameTr: 'San Marino', primaryLangCode: 'it' },
  { alpha2: 'SO', name: 'Somalia', nameTr: 'Somali', primaryLangCode: 'so' },
  { alpha2: 'SR', name: 'Suriname', nameTr: 'Surinam', primaryLangCode: 'nl' },
  { alpha2: 'SS', name: 'South Sudan', nameTr: 'Güney Sudan', primaryLangCode: 'en' },
  { alpha2: 'ST', name: 'São Tomé and Príncipe', nameTr: 'São Tomé ve Príncipe', primaryLangCode: 'pt' },
  { alpha2: 'SX', name: 'Sint Maarten (Dutch part)', nameTr: 'Sint Maarten (Hollanda Tarafı)', primaryLangCode: 'nl' },
  { alpha2: 'SY', name: 'Syrian Arab Republic', nameTr: 'Suriye', primaryLangCode: 'ar' },
  { alpha2: 'TC', name: 'Turks and Caicos Islands', nameTr: 'Turks ve Caicos Adaları', primaryLangCode: 'en' },
  { alpha2: 'TF', name: 'French Southern Territories', nameTr: 'Fransız Güney Toprakları', primaryLangCode: 'fr' },
  { alpha2: 'TG', name: 'Togo', nameTr: 'Togo', primaryLangCode: 'fr' },
  { alpha2: 'TJ', name: 'Tajikistan', nameTr: 'Tacikistan', primaryLangCode: 'tg' },
  { alpha2: 'TK', name: 'Tokelau', nameTr: 'Tokelau', primaryLangCode: 'en' },
  { alpha2: 'TL', name: 'Timor-Leste', nameTr: 'Doğu Timor', primaryLangCode: 'pt' },
  { alpha2: 'TM', name: 'Turkmenistan', nameTr: 'Türkmenistan', primaryLangCode: 'tk' },
  { alpha2: 'TO', name: 'Tonga', nameTr: 'Tonga', primaryLangCode: 'en' },
  { alpha2: 'TT', name: 'Trinidad and Tobago', nameTr: 'Trinidad ve Tobago', primaryLangCode: 'en' },
  { alpha2: 'TV', name: 'Tuvalu', nameTr: 'Tuvalu', primaryLangCode: 'en' },
  { alpha2: 'TW', name: 'Taiwan', nameTr: 'Tayvan', primaryLangCode: 'zh' },
  { alpha2: 'TZ', name: 'Tanzania, United Republic of', nameTr: 'Tanzanya', primaryLangCode: 'sw' },
  { alpha2: 'UG', name: 'Uganda', nameTr: 'Uganda', primaryLangCode: 'en' },
  { alpha2: 'UM', name: 'United States Minor Outlying Islands', nameTr: 'ABD Küçük Dış Adaları', primaryLangCode: 'en' },
  { alpha2: 'VA', name: 'Holy See (Vatican City State)', nameTr: 'Vatikan', primaryLangCode: 'it' },
  { alpha2: 'VC', name: 'Saint Vincent and the Grenadines', nameTr: 'Saint Vincent ve Grenadinler', primaryLangCode: 'en' },
  { alpha2: 'VE', name: 'Venezuela', nameTr: 'Venezuela', primaryLangCode: 'es' },
  { alpha2: 'VG', name: 'Virgin Islands, British', nameTr: 'İngiliz Virjin Adaları', primaryLangCode: 'en' },
  { alpha2: 'VI', name: 'Virgin Islands, U.S.', nameTr: 'ABD Virjin Adaları', primaryLangCode: 'en' },
  { alpha2: 'VU', name: 'Vanuatu', nameTr: 'Vanuatu', primaryLangCode: 'en' },
  { alpha2: 'WF', name: 'Wallis and Futuna', nameTr: 'Wallis ve Futuna', primaryLangCode: 'fr' },
  { alpha2: 'WS', name: 'Samoa', nameTr: 'Samoa', primaryLangCode: 'en' },
  { alpha2: 'YT', name: 'Mayotte', nameTr: 'Mayotte', primaryLangCode: 'fr' },
];

const FLAG_CDN_BASE = 'https://flagcdn.com/w80';

@Injectable()
export class CountriesSeeder {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async seed(): Promise<{
    added: number;
    skipped: number;
    missingLang: number;
    total: number;
  }> {
    console.log('🌍 Starting countries seeding...');

    const allLanguages = await this.languageRepository.find();
    const langByCode = new Map<string, number>();
    for (const l of allLanguages) {
      if (l.code) {
        langByCode.set(String(l.code).toLowerCase(), l.id);
      }
    }

    let added = 0;
    let skipped = 0;
    let missingLang = 0;

    for (let i = 0; i < COUNTRY_SEED.length; i += 1) {
      const seed = COUNTRY_SEED[i];
      const alpha2 = seed.alpha2.toUpperCase();
      const flagUrl = `${FLAG_CDN_BASE}/${alpha2.toLowerCase()}.png`;

      const existing = await this.countryRepository.findOne({
        where: { alpha2 },
      });

      const langCode = seed.primaryLangCode
        ? seed.primaryLangCode.toLowerCase()
        : null;
      const primaryLanguageId = langCode ? langByCode.get(langCode) ?? null : null;
      if (langCode && !primaryLanguageId) {
        console.warn(
          `⚠️  Dil bulunamadı: ${seed.name} (${alpha2}) → langCode='${langCode}' languages tablosunda yok. primaryLanguageId null kaldı.`,
        );
        missingLang += 1;
      }

      if (existing) {
        console.log(`⏭️  Var: ${seed.name} (${alpha2})`);
        skipped += 1;
        continue;
      }

      const entity = this.countryRepository.create({
        alpha2,
        name: seed.name,
        nameTr: seed.nameTr,
        flagUrl,
        primaryLanguageId,
        displayOrder: i,
        isActive: true,
      });
      await this.countryRepository.save(entity);
      console.log(
        `✅ Eklendi: ${seed.name} (${alpha2}) → langId=${primaryLanguageId ?? 'null'}`,
      );
      added += 1;
    }

    const total = COUNTRY_SEED.length;
    console.log(
      `🎉 Countries seeding tamamlandı. Toplam: ${total}, Eklendi: ${added}, Atlandı: ${skipped}, Dil eşleşmesi yok: ${missingLang}`,
    );
    return { added, skipped, missingLang, total };
  }
}
