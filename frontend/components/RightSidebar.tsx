export default function RightSidebar() {
  const friends = [
    { name: 'Steve Jobs', title: 'CEO of Apple', img: '/images/card_ppl1.png', online: false, lastSeen: '5 minute ago' },
    { name: 'Ryan Roslansky', title: 'CEO of Linkedin', img: '/images/card_ppl2.png', online: true },
    { name: 'Dylan Field', title: 'CEO of Figma', img: '/images/card_ppl3.png', online: true },
    { name: 'Karim Saif', title: 'Software Engineer', img: '/images/card_ppl4.png', online: false, lastSeen: '2 hours ago' },
    { name: 'Alice Johnson', title: 'Product Manager', img: '/images/people1.png', online: true },
  ];

  return (
    <div className="_layout_right_sidebar_wrap">
      <div className="_layout_right_sidebar_inner">
        <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_feed_right_inner_area_card_content _mar_b24">
            <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
            <span className="_feed_right_inner_area_card_content_txt">
              <a className="_feed_right_inner_area_card_content_txt_link" href="#">See All</a>
            </span>
          </div>
          <form className="_feed_right_inner_area_card_form">
            <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
              <circle cx="7" cy="7" r="6" stroke="#666" />
              <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
            </svg>
            <input className="form-control me-2 _feed_right_inner_area_card_form_inpt" type="search" placeholder="Search friends" aria-label="Search" />
          </form>
          {friends.map((friend) => (
            <div
              key={friend.name}
              className={`_feed_right_inner_area_card_ppl${!friend.online ? ' _feed_right_inner_area_card_ppl_inactive' : ''}`}
            >
              <div className="_feed_right_inner_area_card_ppl_box">
                <div className="_feed_right_inner_area_card_ppl_image">
                  <img src={friend.img} alt={friend.name} className="_ppl_img" />
                  {friend.online && <span className="_feed_right_inner_area_card_ppl_dot"></span>}
                </div>
                <div className="_feed_right_inner_area_card_ppl_txt">
                  <div>
                    <h4 className="_feed_right_inner_area_card_ppl_title">{friend.name}</h4>
                  </div>
                  <p className="_feed_right_inner_area_card_ppl_para">{friend.title}</p>
                </div>
              </div>
              <div className="_feed_right_inner_area_card_ppl_side">
                {!friend.online && friend.lastSeen ? (
                  <span>{friend.lastSeen}</span>
                ) : friend.online ? (
                  <span className="_online_dot" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#52c41a' }}></span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
