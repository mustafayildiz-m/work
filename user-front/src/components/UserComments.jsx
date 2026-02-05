import CommentItem from './cards/components/CommentItem';
import { BsBookmarkCheck, BsChatFill, BsEnvelope, BsHandThumbsUpFill, BsLink, BsPencilSquare, BsReplyFill, BsShare } from 'react-icons/bs';
import { CardFooter, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import LoadContentButton from './LoadContentButton';
import Link from 'next/link';
const UserComments = ({
  comment,
  showStats
}) => {
  const {
    comments,
    commentsCount,
    likesCount
  } = comment;
  return <>
      {showStats && <ul className="nav nav-stack mb-3 small">
          <li className="nav-item">
            <Link className="nav-link" href="" data-bs-container="body" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-custom-class="tooltip-text-start" data-bs-title="Frances Guerrero<br> Lori Stevens<br> Billy Vasquez<br> Judy Nguyen<br> Larry Lawson<br> Amanda Reed<br> Louis Crawford">
              {' '}
              <BsHandThumbsUpFill size={18} className="pe-1" />({likesCount})
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" href="">
              {' '}
              <BsChatFill size={18} className="pe-1" />({commentsCount})
            </Link>
          </li>

          <Dropdown className="nav-item ms-sm-auto" drop="start">
            <DropdownToggle as="a" className="nav-link mb-0 content-none cursor-pointer" id="cardShareAction" data-bs-toggle="dropdown" aria-expanded="false">
              <BsReplyFill size={16} className="flip-horizontal ps-1" />
              (3)
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardShareAction">
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsEnvelope size={22} className="fa-fw pe-2" />
                    Direkt Mesaj ile Gönder
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsBookmarkCheck size={22} className="fa-fw pe-2" />
                  Yer imi{' '}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsLink size={22} className="fa-fw pe-2" />
                  Bağlantıyı gönderiye kopyala
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsShare size={22} className="fa-fw pe-2" />
                  Gönderiyi paylaş …
                </DropdownItem>
              </li>
              <li>
                <DropdownDivider />
              </li>
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsPencilSquare size={22} className="fa-fw pe-2" />
                   Haber Kaynağında Paylaş
                </DropdownItem>
              </li>
            </DropdownMenu>
          </Dropdown>
        </ul>}
      {comments && <ul className="comment-wrap list-unstyled">
          {comments.map(comment => <CommentItem {...comment} key={comment.id} />)}
        </ul>}
      <CardFooter className="border-0 pb-0">{comments && <LoadContentButton name="Daha fazla yorum yükle" />}</CardFooter>
    </>;
};
export default UserComments;