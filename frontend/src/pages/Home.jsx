import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import logo from "../assets/CineBerry-logo.png";

export default function Home() {
    const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [comment, setComment] = useState("");
    const [show, setShow] = useState(false);
    const [item, setItem] = useState([]);
    const [isPostView, setIsPostView] = useState(true);
    let limit = 10;
    let skip = 0;

    // Toast functions
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            navigate("./signup");
        }
        fetchContent();

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [isPostView]);

    const fetchContent = () => {
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
                setData((data) => [...data, ...result]);
            })
            .catch((err) => console.log(err));
    };

    const fetchClips = () => {
        fetch(`/allclips?limit=${limit}&skip=${skip}`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
        })
            .then((res) => res.json())
            .then((result) => {
                setData((data) => [...data, ...result]);
            })
            .catch((err) => console.log(err));
    };

    const handleScroll = () => {
        if (document.documentElement.clientHeight + window.pageYOffset >= document.documentElement.scrollHeight) {
            skip = skip + 10;
            fetchContent();
        }
    };

    const toggleComment = (posts) => {
        setShow(!show);
        setItem(posts);
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
                const newData = data.map((content) => content._id === result._id ? result : content);
                setData(newData);
            });
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
                const newData = data.map((content) => content._id === result._id ? result : content);
                setData(newData);
            });
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
                const newData = data.map((content) => content._id === result._id ? result : content);
                setData(newData);
                setComment("");
                notifyB("Comment posted");
            });
    };

    return (
        <>
        <div>
            <img
        id="cine-berry-logo"
        src={logo}
        alt=""
        onClick={() => {
          navigate("/");
        }}
      />
            </div>

        <div className="home">
            
            <button onClick={() => {
                setIsPostView(!isPostView);
                setData([]);
                skip = 0;
            }}
            id="see-post-clip">
                {isPostView ? "See Clips" : "See Posts"}
            </button>

            {data.map((content) => (
                <div className="card" key={content._id}>
                    <div className="card-header">
                        <div className="card-pic">
                            <img src={content.postedBy.Photo ? content.postedBy.Photo : picLink} alt="" />
                        </div>
                        <h5>
                            <Link to={`/profile/${content.postedBy._id}`}>{content.postedBy.name}</Link>
                        </h5>
                    </div>
                    <div className="card-image">
                        {isPostView ? (
                            <img src={content.photo} alt="" />
                        ) : (
                            <video src={content.video} autoPlay loop />
                        )}
                    </div>
                    <div className="card-content">
                        {content.likes.includes(JSON.parse(localStorage.getItem("user"))._id) ? (
                            <span className="material-symbols-outlined material-symbols-outlined-red" onClick={() => unlikeContent(content._id)}>
                                favorite
                            </span>
                        ) : (
                            <span className="material-symbols-outlined" onClick={() => likeContent(content._id)}>
                                favorite
                            </span>
                        )}
                        <p>{content.likes.length} Likes</p>
                        <p style={{ lineHeight: "1.6", marginBottom: "10px" }}>
                            {isPostView ? content.body : content.description}
                        </p>
                        <p style={{ fontWeight: "bold", cursor: "pointer", marginBottom: "10px" }} onClick={() => toggleComment(content)}>
                            View all comments
                        </p>
                    </div>
                    <div className="add-comment">
                        <span className="material-symbols-outlined">mood</span>
                        <input type="text" placeholder="Add a comment" value={comment} onChange={(e) => setComment(e.target.value)} />
                        <button className="comment" onClick={() => makeComment(comment, content._id)}>
                            Post
                        </button>
                    </div>
                </div>
            ))}

            {show && (
                <div className="showComment">
                    <div className="container">
                        <div className="details">
                            <div className="comment-section">
                                {item.comments.map((comment) => (
                                    <p key={comment._id} className="comm">
                                        <span className="commenter" style={{ fontWeight: "bolder" }}>
                                            {comment.postedBy.name}
                                        </span>{" "}
                                        <span className="commentText">
                                            {comment.comment}
                                        </span>
                                    </p>
                                ))}
                            </div>
                            <div className="card-content">
                                <p>{item.likes.length} Likes</p>
                                <p>{isPostView ? item.body : item.description}</p>
                            </div>
                            <div className="add-comment">
                                <span className="material-symbols-outlined">mood</span>
                                <input type="text" placeholder="Add a comment" value={comment} onChange={(e) => setComment(e.target.value)} />
                                <button className="comment" onClick={() => { makeComment(comment, item._id); toggleComment(); }}>
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="close-comment" onClick={() => toggleComment()}>
                        <span className="material-symbols-outlined material-symbols-outlined-comment">close</span>
                    </div>
                </div>
            )}
        </div>

        </>
    );
}
