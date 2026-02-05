'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form, Spinner, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLanguage } from '@/context/useLanguageContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { BsEye, BsEyeSlash, BsGeoAlt } from 'react-icons/bs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ChangePassword = () => {
  const { t } = useLanguage();
  const { theme } = useLayoutContext();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isReadOnly, setIsReadOnly] = useState(true);

  // Disable autofill on mount and clear any auto-filled values
  useEffect(() => {
    const clearInputs = () => {
      const form = document.getElementById('change-password-form-unique');
      if (form) {
        form.setAttribute('autocomplete', 'off');
        const inputs = form.querySelectorAll('input[type="password"], input[type="text"]');
        inputs.forEach(input => {
          // Otomatik doldurulan değerleri temizle
          input.value = '';
          input.setAttribute('autocomplete', 'off');
          input.setAttribute('autocorrect', 'off');
          input.setAttribute('autocapitalize', 'off');
          input.setAttribute('spellcheck', 'false');
        });
      }

      // Form data'yı da temizle
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    };

    // İlk temizleme
    clearInputs();

    // Gecikmeli temizlemeler (password manager'lar için)
    const timer1 = setTimeout(clearInputs, 50);
    const timer2 = setTimeout(clearInputs, 100);
    const timer3 = setTimeout(clearInputs, 200);
    const timer4 = setTimeout(clearInputs, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Form değişiklik kontrolü - hiçbir alan doluysa enabled
  const hasChanges = formData.currentPassword || formData.newPassword || formData.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    // Toggle butonuna tıklandığında da readonly kaldır
    if (isReadOnly) {
      setIsReadOnly(false);
    }
  };

  const handleFocus = (e) => {
    // İlk tıklamada readonly kaldır
    if (isReadOnly) {
      setIsReadOnly(false);
    }
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = t('settings.account.currentPasswordRequired');
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('settings.account.newPasswordRequired');
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t('settings.account.passwordMinLength');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('settings.account.passwordsNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Lütfen giriş yapın');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/me/change-password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          toast.error(t('settings.account.wrongCurrentPassword'));
        } else {
          toast.error(error.message || t('settings.account.passwordChangeError'));
        }
        return;
      }

      toast.success(t('settings.account.passwordChangeSuccess'));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      // ReadOnly'yi tekrar aktif et
      setIsReadOnly(true);
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(t('settings.account.passwordChangeError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="border-0 pb-0">
          <CardTitle>{t('settings.account.changePassword')}</CardTitle>
          <p className="mb-0 text-muted">{t('settings.account.changePasswordDesc')}</p>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit} autoComplete="nope" id="change-password-form-unique">
            {/* Fake inputs to trick password managers */}
            <input type="text" name="fake-username" style={{ display: 'none' }} tabIndex="-1" />
            <input type="password" name="fake-password" style={{ display: 'none' }} tabIndex="-1" />

            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>{t('settings.account.currentPassword')}</Form.Label>
                  <InputGroup className="align-items-center">
                    <Form.Control
                      type={showPasswords.current ? 'text' : 'password'}
                      name="current-pwd-field"
                      id="pwd-current-unique"
                      value={formData.currentPassword}
                      onChange={(e) => handleChange({ target: { name: 'currentPassword', value: e.target.value } })}
                      onFocus={handleFocus}
                      isInvalid={!!errors.currentPassword}
                      disabled={loading}
                      readOnly={isReadOnly}
                      autoComplete="one-time-code"
                      data-lpignore="true"
                      data-form-type="other"
                      data-1p-ignore
                      style={{
                        background: isDark ? '#2c3034' : 'white',
                        color: isDark ? '#dee2e6' : '#2C3E50',
                        border: isDark ? '1px solid #454d55' : '1px solid #dee2e6',
                        borderRadius: '10px 0 0 10px',
                        height: '40px'
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => togglePasswordVisibility('current')}
                      disabled={loading}
                      style={{
                        background: isDark ? '#2c3034' : 'white',
                        border: isDark ? '1px solid #454d55' : '1px solid #dee2e6',
                        borderLeft: 'none',
                        borderRadius: '0 10px 10px 0',
                        color: isDark ? '#dee2e6' : '#6c757d',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px'
                      }}
                    >
                      {showPasswords.current ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                    </Button>
                  </InputGroup>
                  {errors.currentPassword && (
                    <div className="invalid-feedback d-block">
                      {errors.currentPassword}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>{t('settings.account.newPassword')}</Form.Label>
                  <InputGroup className="align-items-center">
                    <Form.Control
                      type={showPasswords.new ? 'text' : 'password'}
                      name="new-pwd-field"
                      id="pwd-new-unique"
                      value={formData.newPassword}
                      onChange={(e) => handleChange({ target: { name: 'newPassword', value: e.target.value } })}
                      onFocus={handleFocus}
                      isInvalid={!!errors.newPassword}
                      disabled={loading}
                      readOnly={isReadOnly}
                      autoComplete="one-time-code"
                      data-lpignore="true"
                      data-form-type="other"
                      data-1p-ignore
                      style={{
                        background: isDark ? '#2c3034' : 'white',
                        color: isDark ? '#dee2e6' : '#2C3E50',
                        border: isDark ? '1px solid #454d55' : '1px solid #dee2e6',
                        borderRadius: '10px 0 0 10px',
                        height: '40px'
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => togglePasswordVisibility('new')}
                      disabled={loading}
                      style={{
                        background: isDark ? '#2c3034' : 'white',
                        border: isDark ? '1px solid #454d55' : '1px solid #dee2e6',
                        borderLeft: 'none',
                        borderRadius: '0 10px 10px 0',
                        color: isDark ? '#dee2e6' : '#6c757d',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px'
                      }}
                    >
                      {showPasswords.new ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                    </Button>
                  </InputGroup>
                  {errors.newPassword && (
                    <div className="invalid-feedback d-block">
                      {errors.newPassword}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>{t('settings.account.confirmPassword')}</Form.Label>
                  <InputGroup className="align-items-center">
                    <Form.Control
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirm-pwd-field"
                      id="pwd-confirm-unique"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange({ target: { name: 'confirmPassword', value: e.target.value } })}
                      onFocus={handleFocus}
                      isInvalid={!!errors.confirmPassword}
                      disabled={loading}
                      readOnly={isReadOnly}
                      autoComplete="one-time-code"
                      data-lpignore="true"
                      data-form-type="other"
                      data-1p-ignore
                      style={{
                        background: isDark ? '#2c3034' : 'white',
                        color: isDark ? '#dee2e6' : '#2C3E50',
                        border: isDark ? '1px solid #454d55' : '1px solid #dee2e6',
                        borderRadius: '10px 0 0 10px',
                        height: '40px'
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => togglePasswordVisibility('confirm')}
                      disabled={loading}
                      style={{
                        background: isDark ? '#2c3034' : 'white',
                        border: isDark ? '1px solid #454d55' : '1px solid #dee2e6',
                        borderLeft: 'none',
                        borderRadius: '0 10px 10px 0',
                        color: isDark ? '#dee2e6' : '#6c757d',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px'
                      }}
                    >
                      {showPasswords.confirm ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                    </Button>
                  </InputGroup>
                  {errors.confirmPassword && (
                    <div className="invalid-feedback d-block">
                      {errors.confirmPassword}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col xs={12} className="text-end">
                <Button
                  variant="primary"
                  type="submit"
                  className="mb-0"
                  disabled={loading || !hasChanges}
                >
                  {loading ? t('settings.account.saving') : t('settings.account.updatePassword')}
                </Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>

      {/* Disable browser password autofill suggestions */}
      <style jsx global>{`
        /* Hide Chrome password suggestion icon */
        input[name="current-pwd-field"]::-webkit-credentials-auto-fill-button,
        input[name="new-pwd-field"]::-webkit-credentials-auto-fill-button,
        input[name="confirm-pwd-field"]::-webkit-credentials-auto-fill-button {
          visibility: hidden !important;
          display: none !important;
        }
        
        /* Hide autofill background */
        input[type="password"]:-webkit-autofill,
        input[type="text"]:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px ${isDark ? '#2c3034' : 'white'} inset !important;
          -webkit-text-fill-color: ${isDark ? '#dee2e6' : '#000'} !important;
        }

        /* Hide password manager dropdown suggestions */
        input[name="current-pwd-field"],
        input[name="new-pwd-field"],
        input[name="confirm-pwd-field"] {
          -webkit-autofill: off !important;
        }
        
        /* Disable Chrome autofill dropdown completely */
        #change-password-form-unique input[type="password"],
        #change-password-form-unique input[type="text"] {
          background-color: ${isDark ? '#2c3034' : 'white'} !important;
          color: ${isDark ? '#dee2e6' : '#2C3E50'} !important;
        }

        /* Password toggle button styling */
        #change-password-form-unique .input-group .btn-outline-secondary {
          border-left: 0;
        }
        
        #change-password-form-unique .input-group .form-control:focus + .btn-outline-secondary {
          border-color: #0d6efd;
        }

        /* ReadOnly input styling - normal görünsün */
        #change-password-form-unique input[readonly] {
          background-color: ${isDark ? '#2c3034' : 'white'} !important;
          cursor: text !important;
          opacity: 1 !important;
          color: ${isDark ? '#dee2e6' : '#000'} !important;
        }

        /* İlk tıklamada yazılabilir olsun */
        #change-password-form-unique input[readonly]:focus {
          background-color: ${isDark ? '#2c3034' : 'white'} !important;
        }

        /* Force clear autofill */
        #change-password-form-unique input:-webkit-autofill,
        #change-password-form-unique input:-webkit-autofill:hover,
        #change-password-form-unique input:-webkit-autofill:focus,
        #change-password-form-unique input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px ${isDark ? '#2c3034' : 'white'} inset !important;
          box-shadow: 0 0 0 30px ${isDark ? '#2c3034' : 'white'} inset !important;
          -webkit-text-fill-color: ${isDark ? '#dee2e6' : '#000'} !important;
        }
      `}</style>
    </>
  );
};

const AccountSettings = () => {
  const { t } = useLanguage();
  const { theme } = useLayoutContext();
  const isDark = theme === 'dark';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNo: '',
    location: '',
    birthDate: '',
    biography: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Lütfen giriş yapın');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Profil bilgileri yüklenemedi');
      }

      const userData = await response.json();
      setUser(userData);

      // Form verilerini doldur
      const initialData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        email: userData.email || '',
        phoneNo: userData.phoneNo || '',
        location: userData.location || '',
        birthDate: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
        biography: userData.biography || ''
      };

      setFormData(initialData);
      setInitialFormData(initialData);
    } catch (error) {
      console.error('Fetch user error:', error);
      toast.error(t('settings.account.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Telefon numarası için özel kontrol
    if (name === 'phoneNo') {
      // 1. Uzunluk kontrolü (Max 20 karakter)
      if (value.length > 20) return;

      // 2. Karakter kontrolü: Sadece rakam, +, -, boşluk ve parantez
      if (value && !/^[0-9+\-()\s]*$/.test(value)) return;
    }

    // İsim, Soyisim ve Konum alanlarında rakam engelleme
    if (['firstName', 'lastName', 'location'].includes(name)) {
      // Eğer değer rakam içeriyorsa, işlemi durdur
      if (/\d/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form'da değişiklik var mı kontrol et
  const hasChanges = () => {
    if (!initialFormData) return false;

    return Object.keys(formData).some(key => {
      // Email'i karşılaştırmaya dahil etme (değiştirilemez)
      if (key === 'email') return false;
      return formData[key] !== initialFormData[key];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Lütfen giriş yapın');
        return;
      }

      // Email'i çıkar (güncellenemez)
      const { email, ...updateData } = formData;

      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        // Kullanıcı adı zaten varsa özel mesaj göster
        if (error.message && error.message.includes('kullanıcı adı')) {
          toast.error(t('settings.account.usernameAlreadyExists'));
        } else {
          toast.error(error.message || t('settings.account.updateError'));
        }
        return;
      }

      const updatedUser = await response.json();
      setUser(updatedUser);

      // Initial form data'yı güncelle (tekrar disabled olsun)
      const newInitialData = {
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        phoneNo: updatedUser.phoneNo || '',
        location: updatedUser.location || '',
        birthDate: updatedUser.birthDate ? new Date(updatedUser.birthDate).toISOString().split('T')[0] : '',
        biography: updatedUser.biography || ''
      };
      setInitialFormData(newInitialData);

      toast.success(t('settings.account.updateSuccess'));

      // Profil güncellendiği bilgisini diğer bileşenlere duyur
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (error) {
      console.error('Update error:', error);
      toast.error(t('settings.account.updateError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">{t('settings.account.loadingProfile')}</p>
      </div>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="border-0 pb-0">
          <CardTitle className="h5">{t('settings.account.title')}</CardTitle>
          <p className="mb-0 text-muted">{t('settings.account.subtitle')}</p>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label>{t('settings.account.firstName')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group>
                  <Form.Label>{t('settings.account.lastName')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group>
                  <Form.Label>{t('settings.account.username')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group>
                  <Form.Label>{t('settings.account.email')}</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    {t('settings.account.emailCannotBeChanged')}
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group>
                  <Form.Label>{t('settings.account.phoneNo')}</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    placeholder="+90 (555) 123-4567"
                    disabled={saving}
                    maxLength={20}
                  />
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group>
                  <Form.Label>{t('settings.account.location')}</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: isDark ? '#2c3034' : '#f8f9fa', borderColor: isDark ? '#454d55' : '#dee2e6', color: isDark ? '#dee2e6' : '#6c757d' }}>
                      <BsGeoAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="İstanbul, Türkiye"
                      disabled={saving}
                      maxLength={100}
                      list="cities-datalist"
                    />
                  </InputGroup>
                  <datalist id="cities-datalist">
                    <option value="İstanbul" />
                    <option value="Ankara" />
                    <option value="İzmir" />
                    <option value="Adana" />
                    <option value="Adıyaman" />
                    <option value="Afyonkarahisar" />
                    <option value="Ağrı" />
                    <option value="Aksaray" />
                    <option value="Amasya" />
                    <option value="Antalya" />
                    <option value="Ardahan" />
                    <option value="Artvin" />
                    <option value="Aydın" />
                    <option value="Balıkesir" />
                    <option value="Bartın" />
                    <option value="Batman" />
                    <option value="Bayburt" />
                    <option value="Bilecik" />
                    <option value="Bingöl" />
                    <option value="Bitlis" />
                    <option value="Bolu" />
                    <option value="Burdur" />
                    <option value="Bursa" />
                    <option value="Çanakkale" />
                    <option value="Çankırı" />
                    <option value="Çorum" />
                    <option value="Denizli" />
                    <option value="Diyarbakır" />
                    <option value="Düzce" />
                    <option value="Edirne" />
                    <option value="Elazığ" />
                    <option value="Erzincan" />
                    <option value="Erzurum" />
                    <option value="Eskişehir" />
                    <option value="Gaziantep" />
                    <option value="Giresun" />
                    <option value="Gümüşhane" />
                    <option value="Hakkari" />
                    <option value="Hatay" />
                    <option value="Iğdır" />
                    <option value="Isparta" />
                    <option value="Kahramanmaraş" />
                    <option value="Karabük" />
                    <option value="Karaman" />
                    <option value="Kars" />
                    <option value="Kastamonu" />
                    <option value="Kayseri" />
                    <option value="Kırıkkale" />
                    <option value="Kırklareli" />
                    <option value="Kırşehir" />
                    <option value="Kilis" />
                    <option value="Kocaeli" />
                    <option value="Konya" />
                    <option value="Kütahya" />
                    <option value="Malatya" />
                    <option value="Manisa" />
                    <option value="Mardin" />
                    <option value="Mersin" />
                    <option value="Muğla" />
                    <option value="Muş" />
                    <option value="Nevşehir" />
                    <option value="Niğde" />
                    <option value="Ordu" />
                    <option value="Osmaniye" />
                    <option value="Rize" />
                    <option value="Sakarya" />
                    <option value="Samsun" />
                    <option value="Siirt" />
                    <option value="Sinop" />
                    <option value="Sivas" />
                    <option value="Şanlıurfa" />
                    <option value="Şırnak" />
                    <option value="Tekirdağ" />
                    <option value="Tokat" />
                    <option value="Trabzon" />
                    <option value="Tunceli" />
                    <option value="Uşak" />
                    <option value="Van" />
                    <option value="Yalova" />
                    <option value="Yozgat" />
                    <option value="Zonguldak" />
                  </datalist>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>{t('settings.account.birthDate')}</Form.Label>
                  <Form.Control
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>{t('settings.account.biography')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="biography"
                    value={formData.biography}
                    onChange={handleChange}
                    placeholder={t('settings.account.biographyPlaceholder')}
                    maxLength={300}
                    disabled={saving}
                  />
                  <Form.Text className="text-muted">
                    {t('settings.account.characterLimit').replace('{count}', '300')} ({formData.biography.length}/300)
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12} className="text-end">
                <Button
                  variant="primary"
                  type="submit"
                  size="sm"
                  className="mb-0"
                  disabled={saving || !hasChanges()}
                >
                  {saving ? t('settings.account.saving') : t('settings.account.saveChanges')}
                </Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>

      <ChangePassword />
    </>
  );
};

export default AccountSettings;
