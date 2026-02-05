import useFileUploader from '@/hooks/useFileUploader';
import { Card, Col, FormLabel, FormText } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { BsUpload } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

const DropzoneFormInput = ({
  label,
  labelClassName,
  helpText,
  icon,
  iconProps,
  showPreview,
  text,
  textClassName,
  onFileUpload,
  maxFiles = 5
}) => {
  const {
    selectedFiles,
    handleAcceptedFiles,
    removeFile
  } = useFileUploader(showPreview);
  const Icon = icon ?? BsUpload;
  const isProfilePhoto = maxFiles === 1;
  
  return <>
      {label && <FormLabel className={labelClassName}>{label}</FormLabel>}

      <Dropzone onDrop={acceptedFiles => handleAcceptedFiles(acceptedFiles, onFileUpload, maxFiles)} maxFiles={maxFiles}>
        {({
        getRootProps,
        getInputProps
      }) => <div className={`dropzone dropzone-custom cursor-pointer ${isProfilePhoto ? 'profile-dropzone' : ''}`}>
            {/* Show preview for profile photo */}
            {isProfilePhoto && selectedFiles.length > 0 ? (
              <div className="text-center py-2" style={{ position: 'relative' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  margin: '0 auto',
                  position: 'relative'
                }}>
                  <Image 
                    alt="Profile Preview" 
                    src={selectedFiles[0].preview} 
                    width={100}
                    height={100}
                    style={{ 
                      width: '100px', 
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '3px solid #667eea',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                  />
                  <button 
                    className="btn btn-danger rounded-circle position-absolute"
                    style={{
                      top: '-8px',
                      right: '-8px',
                      width: '28px',
                      height: '28px',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      fontSize: '0.8rem'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(selectedFiles[0]);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
                <p className="mt-2 mb-0 small text-muted" style={{ cursor: 'pointer' }} {...getRootProps()}>
                  <input {...getInputProps()} />
                  ✏️ Değiştir
                </p>
              </div>
            ) : (
              <div className="dz-message" {...getRootProps()}>
                <input {...getInputProps()} />
                {!isProfilePhoto && <Icon {...iconProps} className="display-3" />}
                <p className={textClassName} style={{ marginTop: isProfilePhoto ? '0' : '0.5rem' }}>{text}</p>
              </div>
            )}
            
            {/* Standard preview for other files */}
            {!isProfilePhoto && showPreview && selectedFiles.length > 0 && <div className="dz-preview row g-4">
                {(selectedFiles || []).map((file, idx) => <Col md={4} sm={6} key={`file-${idx}-${file.name}`}>
                    <Card className="p-2 mb-0 shadow-none border position-relative h-100">
                      {file.preview ? 
                        <Image 
                          alt={file.name} 
                          src={file.preview} 
                          className="rounded bg-light"
                          width={100}
                          height={100}
                          style={{ width: '100%', height: 'auto' }}
                        /> : 
                        <div className="rounded bg-light text-center">{file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase()}</div>}
                      <div className="mt-2">
                        <p role="button" className="text-body-secondary fw-bold">
                          {file.name}
                        </p>
                        <p className="mb-0 small">{file.formattedSize}</p>
                      </div>
                      <div className="position-absolute top-0 start-100 translate-middle">
                        <button className="btn btn-danger rounded-circle icon-sm p-0 d-flex align-items-center justify-content-center" onClick={() => removeFile(file)}>
                          <FaTimes />
                        </button>
                      </div>
                    </Card>
                  </Col>)}
              </div>}
          </div>}
      </Dropzone>

      {helpText && typeof helpText === 'string' ? <FormText className="small text-muted">{helpText}</FormText> : helpText}
    </>;
};
export default DropzoneFormInput;