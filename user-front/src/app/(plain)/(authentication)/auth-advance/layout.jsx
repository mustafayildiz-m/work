/**
 * Auth sayfalarının kabuğu (sign-in, sign-up, forgot-pass).
 *
 * Bu sayfaların her biri kendi tam ekran düzenini kurar, bu yüzden kabuk
 * hiçbir şey sarmalamaz. Daha önce buradaki Container/Row sarmalaması
 * Bootstrap'in negatif gutter marjlarını devreye sokuyor ve içeriği yatayda
 * taşırıyordu; sayfalar da bundan `position: fixed` ile kaçmak zorunda
 * kalıyordu (bu da mobilde klavye açılınca formun kesilmesine yol açıyordu).
 */
const AuthLayout = ({ children }) => {
  return <main>{children}</main>;
};

export default AuthLayout;
