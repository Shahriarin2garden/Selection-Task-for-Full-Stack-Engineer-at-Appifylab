import { SessionPayload } from '@/types';

interface LeftSidebarProps {
  user: SessionPayload;
}

export default function LeftSidebar({ user }: LeftSidebarProps) {
  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`;

  return (
    <div className="_layout_left_sidebar_wrap">
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_wrap _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_area_profile _mar_b24">
            <div className="_left_inner_area_profile_image">
              <img src={avatarUrl} alt="Profile" className="_profile_img" />
            </div>
            <div className="_left_inner_area_profile_txt">
              <h4 className="_left_inner_area_profile_title">{user.firstName} {user.lastName}</h4>
              <p className="_left_inner_area_profile_para">{user.email}</p>
            </div>
          </div>
          <ul className="_left_inner_area_explore_list">
            <li className="_left_inner_area_explore_item">
              <a href="/feed" className="_left_inner_area_explore_link">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                  <path stroke="#666" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                </svg>
                Home
              </a>
            </li>
            <li className="_left_inner_area_explore_item">
              <a href="#" className="_left_inner_area_explore_link">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" fill="none" viewBox="0 0 22 20">
                  <path fill="#666" fillRule="evenodd" d="M10.79 10.15h.429c2.268.015 7.45.243 7.45 3.732 0 3.466-5.002 3.692-7.415 3.707h-.894c-2.268-.015-7.452-.243-7.452-3.727 0-3.47 5.184-3.697 7.452-3.711l.297-.001h.132zM10.79 0c2.96 0 5.368 2.392 5.368 5.33 0 2.94-2.407 5.331-5.368 5.331h-.031A5.329 5.329 0 016.977 9.09 5.253 5.253 0 015.424 5.327C5.423 2.392 7.83 0 10.789 0z" clipRule="evenodd" />
                </svg>
                Friends
              </a>
            </li>
            <li className="_left_inner_area_explore_item">
              <a href="#" className="_left_inner_area_explore_link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22">
                  <path fill="#666" fillRule="evenodd" d="M9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0z" clipRule="evenodd" />
                </svg>
                Notifications
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_area_suggest_content _mar_b24">
            <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
            <span className="_left_inner_area_suggest_content_txt">
              <a className="_left_inner_area_suggest_content_txt_link" href="#">See All</a>
            </span>
          </div>
          {[
            { name: 'Steve Jobs', title: 'CEO of Apple', img: '/images/people1.png' },
            { name: 'Ryan Roslansky', title: 'CEO of Linkedin', img: '/images/people2.png' },
            { name: 'Dylan Field', title: 'CEO of Figma', img: '/images/people3.png' },
          ].map((person) => (
            <div key={person.name} className="_left_inner_area_suggest_info">
              <div className="_left_inner_area_suggest_info_box">
                <div className="_left_inner_area_suggest_info_image">
                  <img src={person.img} alt={person.name} className="_info_img" />
                </div>
                <div className="_left_inner_area_suggest_info_txt">
                  <h4 className="_left_inner_area_suggest_info_title">{person.name}</h4>
                  <p className="_left_inner_area_suggest_info_para">{person.title}</p>
                </div>
              </div>
              <div className="_left_inner_area_suggest_info_link">
                <a href="#" className="_info_link">Connect</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
