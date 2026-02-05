'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { bookData } from './data';
import { Row, Col, Card, Pagination } from 'react-bootstrap';
import { BsDownload, BsHeart } from 'react-icons/bs';

const itemsPerPage = 12;

export default function BookGrid() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(bookData.length / itemsPerPage);

  const paginatedBooks = bookData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div className="my-5">
      <Row>
        {paginatedBooks.map((book, idx) => (
          <Col key={idx} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <div className="book-card-wrapper position-relative overflow-hidden">
              <Card className="h-100 shadow-sm border-0">
                <div className="img-container position-relative">
                  <Image
                      src={book.image}
                      alt={book.title || 'Kitap Resmi'} // alt text eklemek erişilebilirlik için önemlidir
                      width={250} // Genişlik ve yükseklik, Image bileşeni için gereklidir
                      height={350} // Kart yüksekliğine uygun bir değer verilebilir
                      style={{ objectFit: 'cover' }}
                      className="card-img-top" // Bootstrap class'ı eklendi
                    />
                  <div className="hover-icons d-flex flex-column gap-2">
                    <div className="icon-btn bg-white shadow rounded p-2">
                      <BsHeart />
                    </div>
                    <div className="icon-btn bg-white shadow rounded p-2">
                      <BsDownload />
                    </div>
                  </div>
                </div>
                <Card.Body>
                    <Link href={`/books/${book.id}`} className="text-decoration-none">
                        <Card.Title className="text-center" style={{ fontSize: '1rem' }}>{book.title}</Card.Title>
                    </Link>
                </Card.Body>
              </Card>
            </div>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-center">
        <Pagination className='gap-2'>
          <Pagination.Prev onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} />
          {paginationItems}
          <Pagination.Next onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} />
        </Pagination>
      </div>

      <style jsx="true">{`
        .img-container {
          position: relative;
        }

        .hover-icons {
          position: absolute;
          top: 10px;
          right: -60px;
          transition: right 0.3s ease;
        }

        .book-card-wrapper:hover .hover-icons {
          right: 10px;
        }

        .icon-btn {
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .icon-btn:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}