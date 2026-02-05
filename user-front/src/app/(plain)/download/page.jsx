'use client';

export default function DownloadPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card text-center">
            <div className="card-body p-5">
              <h1 className="mb-4">Download Our App</h1>
              <p className="lead mb-4">
                Download our mobile app for the best experience.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <a 
                  href="#" 
                  className="btn btn-primary btn-lg"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  Download for iOS
                </a>
                <a 
                  href="#" 
                  className="btn btn-primary btn-lg"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  Download for Android
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}