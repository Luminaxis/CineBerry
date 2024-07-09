import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import logo from "../assets/CineBerry-logo.png";

const picLink =
  "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [comment, setComment] = useState("");
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null);
  const [isPostView, setIsPostView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  let limit = 10;
  let skip = 0;

  // Ref for tracking currently playing video with audio
  const currentVideoRef = useRef(null);
  const currentVideoIdRef = useRef(null);
  const isAudioPlayingRef = useRef(false);

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("./signup");
    } else {
      fetchData();
    }
  }, [isPostView]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const video = entry.target;
          video.play().catch((err) => console.log("Failed to play:", err));
          video.muted = false;
        } else {
          const video = entry.target;
          video.pause();
          video.muted = true;
        }
      });
    }, options);

    const videos = document.querySelectorAll("video");
    videos.forEach((video) => observer.observe(video));

    return () => observer.disconnect();
  }, [data]);

  const fetchData = () => {
    setLoading(true);
    if (isPostView) {
      fetchPosts();
    } else {
      fetchClips();
    }
  };

  const fetchPosts = () => {
    fetch(`/allposts?limit=${limit}&skip=${skip}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setData((prevData) => [...prevData, ...result]);
        setLoading(false);
        setHasMore(result.length > 0);
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error fetching posts:", err);
      });
  };

  const fetchClips = () => {
    fetch(`/allclips?limit=${limit}&skip=${skip}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setData((prevData) => [...prevData, ...result]);
        setLoading(false);
        setHasMore(result.length > 0);
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error fetching clips:", err);
      });
  };

  const handleScroll = () => {
    if (!loading && hasMore && window.innerHeight + window.scrollY >= document.body.scrollHeight - 20) {
      skip += limit;
      fetchData();
    }
  };

  const toggleComment = (content) => {
    setShow(!show);
    setItem(content);
  };

  const likeContent = (id) => {
    fetch(isPostView ? "/like" : "/likeClip", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(updatedData);
      })
      .catch((err) => notifyA("Failed to like content"));
  };

  const unlikeContent = (id) => {
    fetch(isPostView ? "/unlike" : "/unlikeClip", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(updatedData);
      })
      .catch((err) => notifyA("Failed to unlike content"));
  };

  const makeComment = (text, id) => {
    fetch(isPostView ? "/comment" : "/commentClip", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        text: text,
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(updatedData);
        setComment("");
        notifyB("Comment posted successfully");
      })
      .catch((err) => notifyA("Failed to post comment"));
  };

  const handleVideoClick = (content) => {
    if (currentVideoRef.current) {
      currentVideoRef.current.pause();
      currentVideoRef.current.removeAttribute("muted");
      isAudioPlayingRef.current = false;
    }
    const video = document.getElementById(content._id);
    if (video) {
      video.play().catch((err) => console.log("Failed to play:", err));
      video.muted = false;
      currentVideoRef.current = video;
      currentVideoIdRef.current = content._id;
      isAudioPlayingRef.current = true;
    }
  };

  return (
    <>
      <div>
        <img
          id="cine-berry-logo"
          src={logo}
          alt="CineBerry Logo"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="home">
        <button
          id="see-post-clip"
          onClick={() => {
            setIsPostView(!isPostView);
            setData([]);
            skip = 0;
          }}
        >
          {isPostView ? "See Clips" : "See Posts"}
        </button>

        {data.map((content) => (
          <div className="card" key={content._id}>
            <div className="card-header">
              <div className="card-pic">
                <img
                  src={content.postedBy?.Photo || picLink}
                  alt="User Profile"
                />
              </div>
              <h5>
                <Link to={`/profile/${content.postedBy?._id}`}>
                  {content.postedBy?.name}
                </Link>
              </h5>
            </div>
            <div className="card-image">
              {isPostView ? (
                <img src={content.photo} alt="Post" />
              ) : (
                <div className="video-placeholder">
                  <video
                    id={content._id}
                    src={content.video}
                    muted
                    playsInline
                    onClick={() => handleVideoClick(content)}
                  />
                </div>
              )}
            </div>
            <div className="card-content">
              {content.likes.includes(JSON.parse(localStorage.getItem("user"))._id) ? (
                <span
                  className="material-symbols-outlined material-symbols-outlined-red"
                  onClick={() => unlikeContent(content._id)}
                >
                  favorite
                </span>
              ) : (
                <span
                  className="material-symbols-outlined"
                  onClick={() => likeContent(content._id)}
                >
                  favorite
                </span>
              )}
              <p>{content.likes.length} Likes</p>
              <p style={{ lineHeight: "1.6", marginBottom: "10px" }}>
                {isPostView ? content.body : content.description}
              </p>
              <p
                style={{
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginBottom: "10px",
                }}
                onClick={() => toggleComment(content)}
              >
                View all comments
              </p>
            </div>
            <div className="add-comment">
              <span className="material-symbols-outlined">mood</span>
              <input
                type="text"
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="comment"
                onClick={() => makeComment(comment, content._id)}
              >
                Post
              </button>
            </div>
          </div>
        ))}

        {show && item && (
          <div className="showComment">
            <div className="container">
              <div className="details">
                <div className="comment-section">
                  {item.comments.map((comment) => (
                    <p key={comment._id} className="comm">
                      <span
                        className="commenter"
                        style={{ fontWeight: "bolder" }}
                      >
                        {comment.postedBy.name}
                      </span>{" "}
                      <span className="commentText">{comment.comment}</span>
                    </p>
                  ))}
                </div>
                <div className="card-content">
                  <p>{item.likes.length} Likes</p>
                  <p>{isPostView ? item.body : item.description}</p>
                </div>
                <div className="add-comment">
                  <span className="material-symbols-outlined">mood</span>
                  <input
                    type="text"
                    placeholder="Add a comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    className="comment"
                    onClick={() => {
                      makeComment(comment, item._id);
                      toggleComment();
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            <div className="close-comment" onClick={() => setShow(false)}>
              <span className="material-symbols-outlined material-symbols-outlined-comment">
                close
              </span>
            </div>
          </div>
        )}

        {loading && <p>Loading...</p>}
        {!hasMore && <p>No more {isPostView ? "posts" : "clips"} to load.</p>}
      </div>
    </>
  );
}
